(function() {

	var configuration = null;
	var database = null;

	var login = function(req, res) {
		res.log('Trying to login ...');
		return {
			status: 'connected',
			response: {
				username: 'cool'
			},
			session: {
				username: 'cool'
			}
		}
	};

	var logout = function(req, res) {
		res.log('Disconnecting.');
		return {
			status: 'disconnected',
			response: {
				username: 'You are offline'
			},
			session: null
		}
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