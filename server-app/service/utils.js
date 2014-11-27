(function() {

	var configuration = null;
	var database = null;

	/**
	 * Load resources from the configuration
	 * @param  {object} configuration Whole configuration
	 * @return {object}               Resource descriptor
	 */
	var loadResources = function(resourceList, configuration) {
		var defaultRoute = require(configuration.basePath + '/resources/default')(database, configuration);
		var resources = {};
		for (var route in resourceList) {
			resources[route] = require(configuration.basePath + '/' + resourceList[route].controller)(database, configuration);
		}
		return {
			resources: resources,
			defaultRoute: defaultRoute
		};
	};

	/**
	 * Instanciate a Monk object on the database
	 * @param  {object} configuration database configuration
	 * @return {object}               Monk object pointing on the database
	 */
	var getDatabase = function(configuration) {
		//var mongo = require('mongodb');
		var monk = require('monk');
		database = monk(configuration.host + ':' + configuration.port + '/' + configuration.database);
		return database;
	};

	/**
	 * Extract fields from an object
	 * @param  {object} object data source
	 * @param  {object} filter mapping for extraction
	 * @return {object}        extracted data
	 */
	var filterObject = function(object, filter) {
		var filtered = {};
		for (var i in filter) {
			if ((filter[i]) && (object[i])) {
				filtered[i] = object[i];
			}
		}
		return filtered;
	};


	module.exports = function(config) {
		configuration = config;
		return {
			loadResources: loadResources,
			getDatabase: getDatabase,
			filterObject: filterObject
		};
	};
})();