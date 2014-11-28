'use strict';

/**
 * @ngdoc function
 * @name forecastMeNow.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ForecastMeNow
 */
angular.module('forecastMeNowApp')
	.controller('MainCtrl', ['$scope', '$modal', '$http', 'registry', function($scope, $modal, $http, registry) {
		$scope.alert = null;

		$scope.signup = function() {
			var modalInstance = $modal.open({
				templateUrl: 'dialogs/signup.html',
				controller: 'ModalSignupCtrl',
				size: 'sm',
				resolve: {
					data: function() {
						return null;
					}
				}

			});
			modalInstance.result.then(function(data) {
				$scope.alert = false;
				$http.put(registry.get('apiUrl') + '/login', data).then(function(data) {
					if (data.data.status === 'ok') {
						$scope.alert = {
							type: 'success',
							message: 'Check your email and click on the validation link'
						};
					} else {
						$scope.alert = {
							type: 'danger',
							message: 'Confirmation email could not be sent: ' + data.data.status
						};
					}
				}, function() {
					$scope.alert = {
						type: 'danger',
						message: 'server error'
					};
				});
			}, function() {});
		};

		$scope.closeAlert = function() {
			$scope.alert = null;
		};

	}]);



angular.module('forecastMeNowApp').controller('ModalSignupCtrl', ['$scope', '$modalInstance', 'data', '$http', 'registry', function($scope, $modalInstance, data, $http, registry) {

	$scope.data = data;
	$scope.error = null;

	$scope.closeAlert = function() {
		$scope.error = null;
	};

	$scope.ok = function() {
		if (($scope.email) && ($scope.user)) {
			$http.get(registry.get('apiUrl') + '/login?user=' + $scope.user).then(function(data) {
				if (data.data.status === 'available') {
					$modalInstance.close({
						user: $scope.user,
						email: $scope.email
					});
				} else {
					var usr = $scope.user;
					$scope.error = usr + ' not available';
				}
			}, function() {
				$scope.error = 'Server error';
			});
		}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);