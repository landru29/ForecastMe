var conf = require('../config.json');
var utils = require('../service/utils')(conf);
var db = utils.getDatabase(conf.db);
var crypto = require('crypto');
var q = require('q');
var users = require('../service/users')(db);

var teams = require('./teams.json');
var pools = require('./pools.json');
var matches = require('./matches.json');
var countries = require('./countries.json');

var usersToInsert = [{
	login: 'admin',
	password: crypto.createHash('sha256').update('password').digest('hex'),
	key: users.generateUUID(),
	email: 'nobody@free.fr',
	role: 'admin'
}, {
	login: 'usr1',
	password: crypto.createHash('sha256').update('password').digest('hex'),
	key: users.generateUUID(),
	email: 'nobody@free.fr',
	role: 'user'
}];

var addUserIndex = function() {
	console.log('> Unique index on users.login and users.key');
	return users.addIndexes();
}

var addUser = function(user) {
	var defered = q.defer();
	console.log('> Insert user');
	users.create(user).then(function(data) {
		console.log('  => ' + data + ' user(s) added');
		defered.resolve(data);
	}, function(err) {
		console.log('  => No user added');
		defered.resolve(null);
	});
	return defered.promise;
};

var userInit = function() {
	var defered = q.defer();
	addUserIndex().then(function() {
		addUser(usersToInsert).then(function() {
			defered.resolve('Success');
		}, function() {
			defered.resolve('  => No user inserted');
		});
	}, function() {
		console.log('ERROR');
		defered.reject('Error: user init');
	});
	return defered.promise;
};

var teamInit = function() {
	var defered = q.defer();
	console.log('> Insert teams');
	db.get('teams').remove({}).then(function() {
		db.get('teams').insert(teamArray).then(function(data) {
			console.log('  => Teams added');
			defered.resolve(data);
		}, function(err) {
			console.log('  => error while adding teams');
			console.log(err);
			defered.reject(err);
		});
	}, function(err) {
		console.log('  => error while droping teams');
		console.log(err);
		defered.reject(err);
	});
	return defered.promise;
};

var poolInit = function() {
	var defered = q.defer();
	console.log('> Insert pools');
	db.get('pools').remove({}).then(function() {
		db.get('pools').insert(poolArray).then(function(data) {
			console.log('  => Pools added');
			defered.resolve(data);
		}, function(err) {
			console.log('  => error while adding pools');
			console.log(err);
			defered.reject(err);
		});
	}, function(err) {
		console.log('  => error while droping pools');
		console.log(err);
		defered.reject(err);
	});
	return defered.promise;
};

var countryInit = function() {
	var defered = q.defer();
	console.log('> Insert countries');
	db.get('countries').remove({}).then(function() {
		db.get('countries').insert(countryArray).then(function(data) {
			console.log('  => Countries added');
			defered.resolve(data);
		}, function(err) {
			console.log('  => error while adding countries');
			console.log(err);
			defered.reject(err);
		});
	}, function(err) {
		console.log('  => error while droping countries');
		console.log(err);
		defered.reject(err);
	});
	return defered.promise;
};

var matchInit = function() {
	var defered = q.defer();
	console.log('> Insert matches');
	db.get('matches').remove({}).then(function() {
		db.get('matches').insert(countryArray).then(function(data) {
			console.log('  => Matches added');
			defered.resolve(data);
		}, function(err) {
			console.log('  => error while adding matches');
			console.log(err);
			defered.reject(err);
		});
	}, function(err) {
		console.log('  => error while droping matches');
		console.log(err);
		defered.reject(err);
	});
	return defered.promise;
};

var computeGames = function() {
	countryArray = [];
	for (var code in countries) {
		countryArray.push(countries[code]);
	}

	teamArray = [];
	for (var code in teams) {
		teams[code].country = countries[code];
		teamArray.push(teams[code]);
	}

	poolArray = [];
	for (var group in pools) {
		for (var index in pools[group]) {
			pools[group][index] = teams[pools[group][index]];
		}
		poolArray.push({
			name: group,
			pool: pools[group]
		});
	}

	matchArray = [];
	for (var name in matches) {
		matches[name].id = name;
		matchArray.push(matches[name]);
	}
};



computeGames();

q.all([userInit(), teamInit(), poolInit(), countryInit(), matchInit()]).then(function(data) {
	db.close();
}, function(error) {
	db.close();
});