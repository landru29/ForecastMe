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
				findScore(match).then(function() {
					if (match.computed) {
						match.teams = match.computed;
					}
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
			},
			sort: {
				order: 1
			}
		}).then(function(allMatches) {
			var completionPromises = [];
			for (var index in allMatches) {
				completionPromises.push(findScore(allMatches[index]));
			}
			q.all(completionPromises).then(function(_allMatches) {
				for (var i in _allMatches) {
					if (_allMatches[i].computed) {
						_allMatches[i].teams = _allMatches[i].computed
					}
				}
				defered.resolve(reorganizeMatches(_allMatches));
			}, function(err) {
				defered.reject(err);
			});
		}, function(err) {
			defered.reject('Database error on matches: ' + err);
		});
		return defered.promise;
	};

	/**
	 * Get all matches with teams
	 */
	var getAllMatchTeam = function() {
		var defered = q.defer();
		matches.find({}, {
			fields: {
				teams: true,
				name: true,
				_id: false
			}
		}).then(function(allMatches) {
			defered.resolve(allMatches);
		}, function(err) {
			defered.reject('Database error on matches: ' + err);
		});
		return defered.promise;
	};

	/**
	 * Update the computed teams of a match
	 */
	var updateComputedTeams = function(name, data) {
		var defered = q.defer();
		matches.update({
			name: name
		}, {
			$set: {
				computed: data.computed
			}
		}).then(function() {
			defered.resolve();
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
			getAllMatchTeam: getAllMatchTeam,
			updateComputedTeams: updateComputedTeams
		};
	};
})();