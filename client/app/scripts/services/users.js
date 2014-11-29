'use strict';

/**
 * @ngdoc service
 * @name forecastMeNow.parse
 * @description
 * # parse
 * Provider in the forecastMeNowApp.
 */
angular.module('forecastMeNowApp')
	.factory('users', ['$http', '$q', 'registry', '$sessionStorage', function($http, $q, registry, $sessionStorage) {
		var $storage = $sessionStorage;
		var user = null;
		var setSession = function(key, login, role) {
			if ((key !== null) && (key !== null) && (key !== null)) {
				user = {
					username: login,
					userKey: key,
					role: role
				};
				$storage.user = user;
			} else {
				user = null;
				delete $storage.user;
			}
		};
		var getSession = function() {
			if (user === null) {
				user = $storage.user;
			}
			return user;
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
						setSession(response.data.data.key, response.data.data.login, response.data.data.role);
						deferred.resolve(response.data);
					} else {
						console.log('Bad user/password');
						setSession(null, null, null);
						deferred.reject('Bad user/password');
					}
				}, function(err) {
					console.log('login error');
					setSession(null, null, null);
					deferred.reject(err);
				});
				return deferred.promise;
			},
			logOut: function() {
				var deferred = $q.defer();
				setSession(null, null, null);
				deferred.resolve(null);
				return deferred.promise;
			},
			getCurrentUser: function() {
				return getSession();
			},
			isConnected: function() {
				if (getSession()) {
					return true;
				} else {
					return false;
				}
			},
			setSession: setSession,
			getName: function() {
				var thisUser = getSession();
				return (thisUser ? thisUser.username : null);
			},
			hasRole: function(role) {
				var thisUser = getSession();
				if ((thisUser) && (thisUser.role)) {
					var roles = (Object.prototype.toString.call(thisUser.role) === '[object Array]') ? thisUser.role : [thisUser.role];
					return (roles.indexOf(role) > -1);
				} else {
					return false;
				}
			},
			getKey: function() {
				var thisUser = getSession();
				if ((thisUser) && (thisUser.userKey)) {
					return (thisUser.userKey);
				} else {
					return '';
				}
			}
		};

	}]);