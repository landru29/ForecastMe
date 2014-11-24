(function () {
	var $q = require('q');
	var configuration = null;
	var database = null;
	var collectionName = 'syslog';

	var getOne = function () {
		var defered = $q.defer();
		defered.reject('not implemented');
		return defered.promise;
	};

	var getAll = function (filter) {
		var defered = $q.defer();
		defered.reject('not implemented');
		return defered.promise;
	};

	var push = function (data) {
		var defered = $q.defer();
		var saveData = data;
		saveData['server-date'] = new Date();
		database.get(collectionName).insert(saveData, function (err, syslog) {
			if (!err) {
				defered.resolve(syslog);
			} else {
				defered.reject(err);
			}
		});

		return defered.promise;
	};

	module.exports = function (db, config) {
		configuration = config;
		database = db;
		return {
			getOne: getOne,
			getAll: getAll,
			push: push
		};
	};
})();