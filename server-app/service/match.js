(function() {

	var q = require('q');
	var crypto = require('crypto');
	var configuration = null;
	var pools = null;
	var matches = null;
	var scores = null;

	var findScore = function(match) {
		var defered = q.defer();
		scores.findOne({
			"matchName": match.name
		}, {
			fields: {
				_id: false
			}
		}).then(function(score) {
			if (score) {
				match.score = [score.team0.score, score.team1.score];
			}
			defered.resolve(match);
		}, function(err) {
			defered.reject('Database error on scores: ' + err);
		});
		return defered.promise;
	};

	var getTeamFromPool = function(name) {
		var defered = q.defer();
		var poolName = (name.split('.'))[0];
		var teamName = (name.split('.'))[1];
		pools.findOne({
			"name": poolName
		}, {
			fields: {
				_id: false
			}
		}).then(function(pool) {
			if (pool) {
				if (pool.pool[teamName]) {
					defered.resolve(pool.pool[teamName]);
				} else {
					defered.resolve(null);
				}
			} else {
				defered.resolve(null);
			}
		}, function(err) {
			defered.reject('Database error on scores: ' + err);
		});
		return defered.promise;
	}

	var getTeamFromScore = function(name) {
		var defered = q.defer();
		defered.resolve(null);
		return defered.promise;
	}

	var getTeam = function(name) {
		var defered = q.defer();
		getTeamFromPool(name).then(function(teamFromPool) {
			if (teamFromPool) {
				defered.resolve(teamFromPool);
			} else {
				getTeamFromScore(name).then(function(teamFromScore) {
					defered.resolve(teamFromScore);
				}, function(err) {
					defered.reject(err);
				})
			}
		}, function(err) {
			defered.reject(err);
		})
		return defered.promise;
	}

	var findTeam = function(match) {
		var defered = q.defer();
		var teamDefered = [q.defer(), q.defer()];
		var teamPromise = [teamDefered[0].promise, teamDefered[1].promise];
		var teams = [null, null];

		getTeam(match.teams[0]).then(function(team) {

			teams[0] = team;
			teamDefered[0].resolve(team);
		}, function(err) {
			defered.reject(err);
			teamDefered[0].reject(err);
		});

		getTeam(match.teams[1]).then(function(team) {
			teams[1] = team;
			teamDefered[1].resolve(team);
		}, function(err) {
			defered.reject(err);
			teamDefered[1].reject(err);
		});

		q.all(teamPromise).then(function() {
			match.teams[0] = (teams[0] ? teams[0] : match.teams[0]);
			match.teams[1] = (teams[1] ? teams[1] : match.teams[1]);
			defered.resolve(match);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var reorganizeMatches = function(allMatches) {
		var groups = {};
		for (var index in allMatches) {
			var thisGroup = allMatches[index].group;
			if (!groups[thisGroup]) {
				groups[thisGroup] = {};
			}
			var nameArray = allMatches[index].name.split('.');
			groups[thisGroup][nameArray[nameArray.length - 1]] = allMatches[index];
		}
		return groups;
	};

	var getOneMatch = function(matchName) {
		var defered = q.defer();
		matches.findOne({
			"name": matchName
		}, {
			fields: {
				_id: false
			}
		}).then(function(match) {
			if (match) {
				var completionPromises = [];
				completionPromises.push(findScore(match));
				completionPromises.push(findTeam(match));
				q.all(completionPromises).then(function() {
					defered.resolve(match);
				}, function(err) {
					defered.reject('Database error on scores: ' + err);
				});
			} else {
				defered.reject('No match found');
			}
		}, function(err) {
			defered.reject('Database error on matches: ' + err);
		});
		return defered.promise;
	};

	var getAllMatches = function() {
		var defered = q.defer();
		matches.find({}, {
			fields: {
				_id: false
			}
		}).then(function(allMatches) {
			var completionPromises = [];
			for (var index in allMatches) {
				completionPromises.push(findScore(allMatches[index]));
				completionPromises.push(findTeam(allMatches[index]));
			}
			q.all(completionPromises).then(function() {
				defered.resolve(reorganizeMatches(allMatches));
			}, function(err) {
				defered.reject(err);
			});
		}, function(err) {
			defered.reject('Database error on matches: ' + err);
		});
		return defered.promise;
	};

	module.exports = function(db, config) {
		configuration = config;
		pools = db.get('pools');
		matches = db.get('matches');
		scores = db.get('scores');
		return {
			getOneMatch: getOneMatch,
			getAllMatches: getAllMatches,
			getTeam: getTeam
		};
	};
})();