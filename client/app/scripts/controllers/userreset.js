'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:UserresetCtrl
 * @description
 * # UserresetCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('UserresetCtrl', ['$scope', '$rootScope', '$routeParams', 'registry', '$http', '$location', 'users', function($scope, $rootScope, $routeParams, registry, $http, $location, users) {
		$scope.data = {
			user: $routeParams.user,
			key: $routeParams.key,
			email: $routeParams.email
		};
		$scope.alert = null;

		$scope.send = function() {
			if ($scope.password !== $scope.data.password) {
				$scope.alert = {
					type: 'danger',
					message: 'Passwords do not match'
				};
				return;
			}
			if ((!$scope.data.password) || ($scope.data.password === '')) {
				$scope.alert = {
					type: 'danger',
					message: 'Specify a password'
				};
				return;
			}
			if ($scope.data.password.length < 5) {
				$scope.alert = {
					type: 'danger',
					message: 'Password: 5 digits minimum'
				};
				return;
			}
			$scope.alert = null;
			$http.post(registry.get('apiUrl') + '/user-create/reset', $scope.data).then(function(data) {
				if (data.data.status === 'done') {
					users.setSession(data.data.key, data.data.user, data.data.role);
					$rootScope.$broadcast('check-session');
					$location.path('/');
				} else {
					$scope.alert = {
						type: 'danger',
						message: 'Could not reset account. Retry'
					};
				}
			}, function() {
				$scope.alert = {
					type: 'danger',
					message: 'server error'
				};
			});
		};

		$scope.closeAlert = function() {
			$scope.alert = null;
		};

	}]);