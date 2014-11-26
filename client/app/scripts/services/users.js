'use strict';

/**
 * @ngdoc service
 * @name forecastMeNow.parse
 * @description
 * # parse
 * Provider in the forecastMeNowApp.
 */
angular.module('forecastMeNowApp')
	.factory('users', ['$http', '$q', 'registry', function($http, $q, registry) {
		var connected = false;
		var userKey = null;
		return {
			logIn: function(login, password) {
				var deferred = $q.defer();
				$http.post(registry.get('apiUrl') + 'login', {
					user: login,
					password: password
				}).then(function(response) {
					if (response.data.data) {
						console.log('connected');
						connected = true;
						userKey = response.data.data.key;
						deferred.resolve(response.data);
					} else {
						console.log('Bad user/password');
						connected = false;
						userKey = null;
						deferred.reject('Bad user/password');
					}
				}, function(err) {
					console.log('login error');
					connected = false;
					userKey = null;
					deferred.reject(err);
				});
				return deferred.promise;
			},
			logOut: function() {
				var deferred = $q.defer();
				$http.post('http://localhost:3000/logout', null).then(function(response) {
					if (response.data.status === 'disconnected') {
						connected = false;
						deferred.resolve(response.data);
					} else {
						deferred.reject('Could not disconnect');
					}
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			},
			getCurrentUser: function() {
				return {
					key: userKey
				};
			},
			isConnected: function() {
				return connected;
			}
		};

	}]);