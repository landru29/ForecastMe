(function() {

	var users = null;
	var q = require('q');
	var crypto = require('crypto');

	var addIndexes = function() {
		return q.all([users.index('login', {
			unique: true
		}), users.index('key', {
			unique: true
		})]);
	};

	var createUser = function(user) {
		var defered = q.defer();
		users.insert(user).then(function(data) {
			if (Object.prototype.toString.call(user) === '[object Array]') {
				defered.resolve(user.length);
			} else {
				defered.resolve(1);
			}

		}, function(err) {
			defered.reject(err);
		});
		return defered.promise;
	};


	module.exports = function(db) {
		users = db.get('users');
		return {
			create: createUser,
			addIndexes: addIndexes
		};
	};
})();