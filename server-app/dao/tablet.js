(function () {
	var $q = require('q');
	var configuration = null;
	var database = null;
	var collectionName = 'tablets';

	var getOne = function (uuid) {
		var defered = $q.defer();
		database.get(collectionName).findOne({
			UUID: uuid
		}, {
			fields: {
				_id: false
			}
		}, function (err, tablet) {
			if (!err) {
				defered.resolve(tablet);
			} else {
				defered.reject(err);
			}
		});
		return defered.promise;
	};

	var getAll = function (filter) {
		var defered = $q.defer();
		database.get(collectionName).find(filter, {
			fields: {
				_id: false
			}
		}, function (err, tablet) {
			if (!err) {
				defered.resolve(tablet);
			} else {
				defered.reject(err);
			}
		});
		return defered.promise;
	};

	var add = function (data) {
		var defered = $q.defer();
		if (!data.UUID) {
			defered.reject(e);
		} else {
			var saveData = data;
			saveData.role = 'tablet';
			database.get(collectionName).insert(saveData, function (err, tablet) {
				if (!err) {
					defered.resolve(tablet);
				} else {
					defered.reject(err);
				}
			});
		}
		return defered.promise;
	};

	var update = function (data) {
		var defered = $q.defer();
		if (!data.UUID) {
			defered.reject('Missing UUID');
		} else {
			getOne(data.UUID).then(function (readData) {
				// enrich data (merge new data and database data)
				if (readData) {
					for (var i in data) {
						readData[i] = data[i];
					}
				} else {
					readData = {};
				}
				// upsert data in database
				database.get(collectionName).update({
					UUID: data.UUID
				}, readData, {
					upsert: true
				}, function (err, tablet) {
					if (!err) {
						defered.resolve(tablet);
					} else {
						defered.reject(err);
					}
				});
			}, function (err) {
				defered.reject(err);
			});
		}
		return defered.promise;
	};

	var destroy = function (UUID) {
		var defered = $q.defer();
		defered.reject("Not implemented");
		return defered.promise;
	};

	module.exports = function (db, config) {
		configuration = config;
		database = db;
		// Ensure unique UUID
		db.get(collectionName).index('UUID', {
			unique: true
		});
		return {
			getOne: getOne,
			getAll: getAll,
			add: add,
			update: update,
			destroy: destroy
		};
	};
})();