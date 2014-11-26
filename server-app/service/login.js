(function() {

	var configuration = null;
	var users = null;
	var q = require('q');
	var crypto = require('crypto');


	var login = function(req, res) {
		defered = q.defer();
		res.log('Trying to login ...');
		res.log('login: ' + req.body.user);
		res.log('password: ' + crypto.createHash('sha256').update(req.body.password).digest('hex'));
		if ((req.body.user) && ((req.body.password))) {
			users.findOne({
				login: req.body.user,
				password: crypto.createHash('sha256').update(req.body.password).digest('hex')
			}).then(function(data) {
				if (data) {
					defered.resolve({
						status: 'connected',
						response: data,
						session: data
					});
				} else {
					defered.reject({
						status: 'disconnected',
						response: null,
						session: null
					});
				}
			}, function(message) {});
		} else {
			defered.reject({
				status: 'disconnected',
				response: null,
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
		users = db.get('users');
		return {
			login: login,
			logout: logout
		};
	};
})();