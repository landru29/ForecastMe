var conf = require('../config.json');
var utils = require('../service/utils')(conf);
var db = utils.getDatabase(conf.db);
var crypto = require('crypto');

var q = require('q');


var generateUUID = function() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
	});
	return uuid;
};


var firstUser = {
	login: 'admin',
	password: crypto.createHash('sha256').update('password').digest('hex'),
	key: generateUUID(),
	email: 'nobody@free.fr'
}

var addUserIndex = function() {
	console.log('> Unique index on users.login');
	return db.get('users').index('login', {
		unique: true
	}); // unique
};


var addUser = function(user) {
	var defered = q.defer();
	console.log('> Insert user');
	db.get('users').insert(user).then(function(data) {
		console.log(data);
		defered.resolve(data);
	}, function(err) {
		console.log('error');
		console.log(err);
		defered.reject(err);
	});
	return defered.promise;
};


addUserIndex().then(function() {
	addUser(firstUser).then(function() {
		db.close();
	}, function() {
		db.close();
	});
}, function() {
	console.log('ERROR');
	db.close();
});