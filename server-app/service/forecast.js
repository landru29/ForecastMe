(function () {

	var configuration = null;
	var users = null;
	var q = require('q');
	var configuration = null;
	var forecasts = null;
	var userService = null;
	var scores = null;

	var add = function (userKey, forecast) {
		var defered = q.defer();
		var toSave;
		userService.getUserByKey(userKey).then(function (user) {
			if (Object.prototype.toString.call(someVar) === '[object Array]') {
				toSave = [];
				for (var i in forecast) {
					toSave.push({
						login: user.login,
						key: user.key,
						matchName: forecast[i].match,
						team0: forecast[i].team0,
						team1: forecast[i].team1,
					});
					//upsert many
					dfgfddfg

				}
			} else {
				toSave = {
					login: user.login,
					key: user.key,
					matchName: forecast.match,
					team0: forecast.team0,
					team1: forecast.team1,
				};
				forecasts.update({
					key: user.key,
					matchName: forecast.match
				}, toSave, {
					upsert: true
				}).then(function (data) {
					defered.resolve();
				}, function () {
					defered.reject('Database error on forecasts');
				});
			}
		}, function (err) {
			defered.reject('Database error on users');
		});
		return defered.promise;
	};

	var getAllScores = function () {
		var defered = q.defer();
		scores.find({}, {
			fields: {
				_id: false
			}
		}).then(function (scoreData) {
			defered.resolve(scoreData);
		}, function (err) {
			defered.reject('Database error on scores: ' + err);
		});
		return defered.promise;
	};

	var getAll = function (userKey) {
		var defered = q.defer();
		forecasts.find({
			key: userKey
		}, {
			fields: {
				_id: false
			}
		}).then(function (data) {
			defered.resolve(data);
		}, function () {
			defered.reject('Database error on forecasts');
		});
		return defered.promise;
	};

	var computePoints = function (userKey) {
		var _normalize = function (result) {
			if ('undefined' === typeof result.team0.score) {
				result.team0.value = result.team0.forecast;
			} else {
				result.team0.value = result.team0.score;
			}
			if ('undefined' === typeof result.team1.score) {
				result.team1.value = result.team1.forecast;
			} else {
				result.team1.value = result.team1.score;
			}
			return result;
		};
		var _getScore = function (allScores, matchName) {
			for (var i in allScores) {
				if (allScores[i].matchName === matchName) {
					return _normalize(allScores[i]);
				}
			}
			return null;
		};
		var _getWinner = function (result) {
			if (result.team0.value > result.team1.value) {
				return 0;
			}
			if (result.team0.value < result.team1.value) {
				return 1;
			}
			return null;
		};
		var _getDiff = function (result) {
			var diff = Math.round((result.team0.value - result.team1.value) / configuration.scoring.factor);
			return Math.abs(diff);
		};
		var defered = q.defer();
		q.all([getAll(userKey), getAllScores()]).then(function (data) {
			console.log('Calculating ' + userKey + '...');
			var points = 0;
			var allForecasts = data[0];
			var allScores = data[1];
			for (var i in allForecasts) {
				var thisForecast = _normalize(allForecasts[i]);
				var matchScore = _getScore(allScores, allForecasts[i].matchName);
				if (matchScore) {
					if (_getWinner(thisForecast) === _getWinner(matchScore)) {
						points += configuration.scoring.winner;
					}
					if (_getDiff(thisForecast) === _getDiff(matchScore)) {
						points += configuration.scoring.diff;
					}
				}
			}
			defered.resolve(points);
		}, function (err) {
			console.log('reject');
			defered.reject(err);
		});
		return defered.promise;
	}

	var getRanking = function () {
		var mySorting = function (a, b) {
			if (a.points < b.points)
				return 1;
			if (a.points > b.points)
				return -1;
			return 0;
		};
		var defered = q.defer();
		userService.getUserByRole('user').then(function (data) {
			var rank = [];
			var computers = [];
			for (var i in data) {
				var thisCompute = computePoints(data[i].key);
				console.log('Launch ' + i);
				rank.push({
					login: data[i].login
				});
				computers.push(thisCompute);
			}
			q.all(computers).then(function (allScores) {
				for (var i in rank) {
					rank[i].points = allScores[i];
				}
				console.log(rank);
				defered.resolve(rank.sort(mySorting));
			}, function (err) {
				defered.reject(err)
			});
		}, function (err) {
			defered.reject(err);
		});
		return defered.promise;
	}

	module.exports = function (db, config) {
		configuration = config;
		forecasts = db.get('forecasts');
		userService = require('../service/users')(db, config);
		scores = db.get('scores');
		return {
			add: add,
			getAll: getAll,
			getRanking: getRanking,
			computePoints: computePoints
		};
	};
})();