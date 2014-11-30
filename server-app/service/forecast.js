(function() {

	var configuration = null;
	var users = null;
	var q = require('q');
	var configuration = null;
	var forecasts = null;
	var userService = null;

	var add = function(userKey, forecast) {
		var defered = q.defer();
		userService.getUserByKey(userKey).then(function(user) {
			var toSave = {
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
			}).then(function(data) {
				defered.resolve();
			}, function() {
				defered.reject('Database error on forecasts');
			});
		}, function(err) {
			defered.reject('Database error on users');
		});
		return defered.promise;
	};

	var getAll = function(userKey) {
		var defered = q.defer();
		forecasts.find({
			key: userKey
		}, {
			fields: {
				_id: false
			}
		}).then(function(data) {
			defered.resolve(data);
		}, function() {
			defered.reject('Database error on forecasts');
		});
		return defered.promise;
	};

	var getRanking = function() {
		var defered = q.defer();
		userService.getUserByRole('user').then(function(data) {
			var rank = [];
			for (var i in data) {
				rank.push({
					login: data[i].login,
					points: 0
				});
			}
			defered.resolve(rank);
		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	}

	module.exports = function(db, config) {
		configuration = config;
		forecasts = db.get('forecasts');
		userService = require('../service/users')(db, config);
		return {
			add: add,
			getAll: getAll,
			getRanking: getRanking
		};
	};
})();