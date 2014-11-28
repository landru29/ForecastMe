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
		var username = null;
		var setSession = function(key, user) {
			connected = (key !== null);
			username = user;
			userKey = key;
		};
		return {
			logIn: function(login, password) {
				var deferred = $q.defer();
				$http.post(registry.get('apiUrl') + '/login', {
					user: login,
					password: password
				}, {
					fileds: {
						_id: false
					}
				}).then(function(response) {
					if (response.data.data) {
						console.log('connected');
						setSession(response.data.data.key, response.data.data.login);
						deferred.resolve(response.data);
					} else {
						console.log('Bad user/password');
						setSession(null, null);
						deferred.reject('Bad user/password');
					}
				}, function(err) {
					console.log('login error');
					setSession(null, null);
					deferred.reject(err);
				});
				return deferred.promise;
			},
			logOut: function() {
				var deferred = $q.defer();
				setSession(null, null);
				deferred.resolve(null);
				return deferred.promise;
			},
			getCurrentUser: function() {
				return {
					key: userKey,
					username: username
				};
			},
			isConnected: function() {
				return connected;
			},
			setSession: setSession,
			getName: function() {
				return username;
			}
		};

	}]);