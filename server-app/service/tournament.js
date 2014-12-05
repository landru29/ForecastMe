(function() {

	var q = require('q');
	var crypto = require('crypto');
	var configuration = null;
	var pools = null;
	var matches = null;
	var scores = null;

	var debug = false;


	/**
	 * Get All scores in a group
	 */
	var getGroupScores = function(groupName) {
		var defered = q.defer();
		var getTeams = function(data, name) {
			for (var i in data) {
				if (data[i].name === name) {
					return data[i].teams;
				}
			}
			return null;
		};
		q.all([scores.find({
			matchName: {
				$regex: new RegExp('^' + groupName + '\.')
			}
		}), matches.find({
			group: groupName
		})]).then(function(data) {
			var scoreItems = data[0];
			var matcheItems = data[1];
			var result = [];
			if (scoreItems.length === matcheItems.length) {
				for (var i in scoreItems) {
					var thisScore = {};
					var teams = getTeams(matcheItems, scoreItems[i].matchName);
					if (teams !== null) {
						thisScore[teams[0]] = scoreItems[i].team0.score;
						thisScore[teams[1]] = scoreItems[i].team1.score;
						result.push(thisScore);
					}
				}
			}
			defered.resolve(result);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	/**
	 * Get the winner of a specific match
	 */
	var findMatchWinner = function(groupName, matchName) {
		var defered = q.defer();
		q.all([scores.findOne({
			matchName: groupName + '.' + matchName
		}), matches.findOne({
			name: groupName + '.' + matchName
		})]).then(function(data) {
			var scoreItem = data[0];
			var matchItem = data[1];
			if ((!scoreItem) || (!matchItem)) {
				defered.resolve();
			} else {
				if (scoreItem.team0.score > scoreItem.team1.score) {
					defered.resolve(matchItem.teams[0]);
				} else {
					defered.resolve(matchItem.teams[1]);
				}
			}
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	/**
	 * Get All points in a group; this is used to perform a ranking
	 */
	var getGroupPoints = function(groupName) {
		var defered = q.defer();
		var getTeams = function(result) {
			return Object.keys(result);
		};
		var getWinnerLooser = function(result, looser) {
			var teams = getTeams(result);
			if (result[teams[0]] > result[teams[1]]) {
				return teams[(looser ? 1 : 0)];
			} else {
				return teams[(looser ? 0 : 1)]
			}
		};
		var getDiff = function(result) {
			var teams = getTeams(result);
			return Math.abs(result[teams[0]] - result[teams[1]]);
		};
		getGroupScores(groupName).then(function(groupScore) {
			var result = {};
			for (var i in groupScore) {
				var winner = getWinnerLooser(groupScore[i], false);
				var looser = getWinnerLooser(groupScore[i], true);
				var teams = getTeams(groupScore[i]);
				for (var n in teams) {
					if ('undefined' === typeof result[teams[n]]) {
						result[teams[n]] = 0;
					}
				}
				//result[winner] += 1 + getDiff(groupScore[i]) / 10000;
				result[winner] += getDiff(groupScore[i]);
				result[looser] -= getDiff(groupScore[i]);
			}
			defered.resolve(result);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	/**
	 * Sort teams in a group
	 */
	var getRanking = function(groupName) {
		var defered = q.defer();
		getGroupPoints(groupName).then(function(groupPoints) {
			var pointsArray = [];
			for (team in groupPoints) {
				pointsArray.push({
					team: team,
					points: groupPoints[team]
				});
			}
			var sorted = pointsArray.sort(function(a, b) {
				if (a.points > b.points) return -1;
				if (a.points < b.points) return 1;
				return 0;
			});
			var result = [];
			for (var i in sorted) {
				result.push(sorted[i].team);
			}
			if (debug) console.log(sorted);
			defered.resolve(result);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var decomposeTeamName = function(teamName) {
		var exploded = teamName.split('.');
		return {
			groupName: exploded[0],
			qualifier: (exploded[1] ? exploded[1] : 1)
		};
	};

	/**
	 * Parse a team name ie: pool.1 return the first of the group 'pool'
	 */
	var parseTeamName = function(teamName) {
		var defered = q.defer();
		var decomposed = decomposeTeamName(teamName);

		if (debug) console.log('Checking for a specific match');
		findMatchWinner(decomposed.groupName, decomposed.qualifier).then(function(winner) {
			if (winner) {
				if (debug) console.log('  => Found a winner ' + winner);
				// a match was found. define the winner
				defered.resolve(winner);
			} else {
				// define the ranking of the group and extract the qualifier
				if (debug) console.log('  => Computin ranking in ' + decomposed.groupName);
				getRanking(decomposed.groupName).then(function(ranking) {
					var index;
					if (ranking.length > 0) {
						if (debug) console.log(decomposed.groupName + '/' + decomposed.qualifier);
						if (!isNaN(decomposed.qualifier)) {
							index = parseInt(decomposed.qualifier, 10) - 1;
						} else {
							switch (decomposed.qualifier) {
								case 'winner':
									index = 0;
									break;
								case 'second':
									index = 1;
									break;
								case 'looser':
									index = ranking.length - 1;
									break;
								default:
									index = ranking.length - 1;
									break;
							}
						}
						defered.resolve(ranking[index]);
					} else {
						defered.resolve();
					}
				}, function(err) {
					defered.reject(err);
				});
			}
		}, function(err) {
			defered.reject(err);
		});



		return defered.promise;
	};

	var getTeamInPools = function(teamName) {
		var defered = q.defer();
		var decomposed = decomposeTeamName(teamName);
		pools.findOne({
			name: decomposed.groupName
		}).then(function(group) {
			var getTeam = function(_group) {
				if (_group) {
					var teams = Object.keys(_group.pool);
					var i = teams.indexOf(decomposed.qualifier);
					if (i > -1) {
						return _group.pool[teams[i]];
					}
				}
				return;
			}
			defered.resolve(getTeam(group));
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};

	var getTeam = function(teamName, occurence) {
		var defered = q.defer();
		var thisOccurence = (!occurence) ? 0 : occurence;
		if (thisOccurence < 10) {
			var decomposed = decomposeTeamName(teamName);
			if (debug) console.log('searching ' + teamName + ' in pools');
			getTeamInPools(teamName).then(function(team) {
				if (!team) {
					if (debug) console.log('  => Not found.')
					if (debug) console.log('Parsing');
					parseTeamName(teamName).then(function(parsedTeamName) {
						if (!parsedTeamName) {
							if (debug) console.log('Empty');
							defered.resolve();
						} else {
							if (debug) console.log('  => Found ' + parsedTeamName);
							if (debug) console.log('! Recursivity #' + (thisOccurence + 1) + ' !');
							getTeam(parsedTeamName, thisOccurence + 1).then(function(team) {
								defered.resolve(team);
							}, function(err) {
								defered.reject(err);
							});
						}
					}, function(err) {
						defered.reject(err);
					});
				} else {
					defered.resolve(team);
				}
			}, function(err) {
				defered.reject(err);
			});
		} else {
			defered.reject('Recursivity error! system reached ' + thisOccurence);
		}
		return defered.promise;
	};

	module.exports = function(db, config) {
		configuration = config;
		pools = db.get('pools');
		matches = db.get('matches');
		scores = db.get('scores');
		return {
			/*getGroupScores: getGroupScores,
			getRanking: getRanking,
			parseTeamName: parseTeamName,*/
			getGroupPoints: getGroupPoints,
			getTeam: getTeam
		};
	};
})();