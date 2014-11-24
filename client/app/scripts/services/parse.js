'use strict';

/**
 * @ngdoc service
 * @name forecastMeNow.parse
 * @description
 * # parse
 * Provider in the forecastMeNow.
 */
angular.module('forecastMeNow')
	.provider('parse', function() {
		/* global Parse */

		// Private variables
		var apiKey = '';
		var apiId = '';

		// Private constructor
		function Greeter() {
			this.logIn = function(login, password) {
				return Parse.User.logIn(login, password);
			};
			this.logOut = function() {
				return Parse.User.logOut();
			};
			this.getCurrentUser = function() {
				return Parse.User.current();
			};
			this.isConnected = function() {
				return (Parse.User.current() !== null);
			};
		}

		// Public API for configuration
		this.setApiKey = function(key) {
			apiKey = key;
		};

		this.setApiId = function(id) {
			apiId = id;
		};

		// Method for instantiating
		this.$get = function() {
			Parse.initialize(apiId, apiKey);
			return new Greeter();
		};
	});