var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var toLog = function (message) {
	return (new Date()).toISOString() + '[' + process.pid + ']: ' + message;
};

// Load configuration
var conf = require('./config.json');
conf.basePath = __dirname;

var utils = require(__dirname + '/service/utils')(conf);
var expressMiddleware = require(__dirname + '/service/express-middleware')(conf);

// log stream
var accessLogStream = fs.createWriteStream(__dirname + '/' + conf.log.file, {
	flags: 'a'
});
accessLogStream.write((new Date()).toISOString() + ' : PID ' + process.pid + " started\n");

accessLogStream.write(toLog('** Initialize Express **') + "\n");
console.log(toLog('** Initialize Express **'));

// Database connection
var db = utils.getDatabase(conf.db);

// Configure ACL
//apiAcl = utils.aclConfiguration(conf, db);

// load resources
var resourceDef = utils.loadResources(conf.resources, conf);

// Initialize the API
var app = express();

// pre treatement
app.use(expressMiddleware.log(accessLogStream));
app.use(expressMiddleware.cors);
app.use(expressMiddleware.fileSystem);
app.use(expressMiddleware.acl);
app.use(bodyParser.json());

// Define the routes
app.use('/', resourceDef.defaultRoute);
for (var route in resourceDef.resources) {
	accessLogStream.write(toLog('> Adding route ' + route) + "\n");
	console.log(toLog('> Adding route ' + route));
	app.use('/' + route, resourceDef.resources[route]);
}

accessLogStream.write(toLog('** Express is ready **') + "\n");
console.log(toLog('** Express is ready **'));
accessLogStream.write("Log format: date [process PID] (request UUID) message\n");
console.log('Log format: date [process PID] (request UUID) message');

// Export the module
module.exports = app;