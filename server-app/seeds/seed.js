var conf = require('../config.json');
var utils = require('../service/utils')(conf);
var db = utils.getDatabase(conf.db);
var crypto = require('crypto');
var q = require('q');
var userService = require('../service/users')(db);

var teams;
var pools;
var matches;
var countries;
var users;
var scores;
var env;


var loadData = function(env) {
	console.log('Loading ' + (env ? env + ' ' : '') + 'data');
	teams = require('./teams' + (env ? '-' + env : '') + '.json');
	pools = require('./pools' + (env ? '-' + env : '') + '.json');
	matches = require('./matches' + (env ? '-' + env : '') + '.json');
	countries = require('./countries' + (env ? '-' + env : '') + '.json');
	users = require('./users' + (env ? '-' + env : '') + '.json');
	scores = require('./score' + (env ? '-' + env : '') + '.json');
};

var addUserIndex = function() {
	console.log('> Unique index on users.login and users.key');
	return userService.addIndexes();
};

var addUser = function(user) {
	var defered = q.defer();
	console.log('> Insert user');
	userService.create(user).then(function(data) {
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
		addUser(users).then(function() {
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
		db.get('matches').insert(matchArray).then(function(data) {
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

var scoreInit = function() {
	var defered = q.defer();
	if (scores.length > 0) {
		console.log('> Insert scores');
		db.get('scores').remove({}).then(function() {
			db.get('scores').insert(scores).then(function(data) {
				console.log('  => Scores added');
				defered.resolve(data);
			}, function(err) {
				console.log('  => error while adding scores');
				console.log(err);
				defered.reject(err);
			});
		}, function(err) {
			console.log('  => error while droping scores');
			console.log(err);
			defered.reject(err);
		});
	} else {
		defered.resolve();
	}
	return defered.promise;
};

var computeData = function() {
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
	var rank = 0;
	for (var group in matches) {
		for (var matchName in matches[group]) {
			var thisMatch = matches[group][matchName];
			thisMatch.name = group + '.' + matchName;
			thisMatch.group = group;
			thisMatch.date = new Date(thisMatch.date);
			thisMatch.order = rank++;
			matchArray.push(thisMatch);
		}
	}

	for (var i in users) {
		users[i].key = userService.generateUUID();
		users[i].password = crypto.createHash('sha256').update(users[i].password).digest('hex');
	}

	//console.log(JSON.stringify(generateScores(matchArray)));
};

var generateScores = function(matchData) {
	var randomInt = function(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	};
	var _scoreArray = []
	for (var i in matchData) {
		var sc1 = randomInt(150, 250);
		var sc2 = randomInt(150, 250);
		if (sc1 === sc2) {
			sc1++;
		}
		_scoreArray.push({
			matchName: matchData[i].name,
			team0: {
				score: sc1,
			},
			team1: {
				score: sc2,
			}
		});
	}
	return _scoreArray;
}


process.argv.forEach(function(val, index, array) {
	if (index === 2) {
		env = val;
	}
});

loadData(env);
computeData();

q.all([userInit(), teamInit(), poolInit(), countryInit(), matchInit(), scoreInit()]).then(function(data) {
	db.close();
}, function(error) {
	db.close();
});