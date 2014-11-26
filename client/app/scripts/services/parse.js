'use strict';

/**
 * @ngdoc service
 * @name forecastMeNow.parse
 * @description
 * # parse
 * Provider in the forecastMeNow.
 */
angular.module('forecastMeNow')
	.factory('parse', ['$http', '$q', function ($http, $q) {
		var connected = false;
		var userKey = null;
		return {
			logIn: function (login, password) {
				var deferred = $q.defer();
				$http.post('http://localhost:3000/login', {
					user: login,
					password: password
				}).then(function (data) {
					console.log(data.data);
					if (data.data) {
						console.log('connected');
						connected = true;
						userKey = data.data.key;
						deferred.resolve(data);
					} else {
						console.log('Bad user/password');
						connected = false;
						userKey = null;
						deferred.reject('Bad user/password');
					}
				}, function (err) {
					console.log('login error');
					connected = false;
					userKey = null;
					deferred.reject(err);
				});
				return deferred.promise;
			},
			logOut: function () {
				return $http.post('http://localhost:3000/logout', null);
			},
			getCurrentUser: function () {
				return {
					key: userKey
				};
			},
			isConnected: function () {
				return connected;
			}
		};

	}]);