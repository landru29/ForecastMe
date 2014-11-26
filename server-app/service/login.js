(function() {

	var configuration = null;
	var database = null;
	var q = require('q');

	var login = function(req, res) {
		defered = q.defer();
		res.log('Trying to login ...');
		if ((req.body.user) && ((req.body.password))) {
			database.find({
				login: req.body.user,
				password: req.body.password
			}).then(function(data) {
				defered.resolve({
					status: 'connected',
					response: data,
					session: data
				});
			}, function(message) {});
		} else {
			defered.resolve({
				status: 'disconnected',
				response: {
					username: 'You are offline'
				},
				session: null
			});
		}
		return defered.promise;
	};

	var logout = function(req, res) {
		defered = q.defer();
		res.log('Disconnecting.');
		defered.resolve({
			status: 'disconnected',
			response: {
				username: 'You are offline'
			},
			session: null
		});
		return defered.promise;
	};

	module.exports = function(db, config) {
		configuration = config;
		database = db;
		return {
			login: login,
			logout: logout
		};
	};
})();