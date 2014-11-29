var conf = require('../config.json');
var utils = require('../service/utils')(conf);
var db = utils.getDatabase(conf.db);

module.exports = {
	configuration: conf,
	database: db
};