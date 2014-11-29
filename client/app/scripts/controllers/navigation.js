'use strict';

/**
 * @ngdoc function
 * @name forecastMeNow.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the forecastMeNow
 */
angular.module('forecastMeNowApp')
	.controller('NavigationCtrl', ['$scope', '$location', '$modal', 'users', function($scope, $location, $modal, users) {

		$scope.getConnectionCaption = function() {
			return (users.isConnected() ? 'Disconnect' : 'Connect');
		};

		$scope.username = users.getName();

		$scope.menu = {
			'home': {
				'caption': 'Home',
				'onClick': 'changeRoute(\'home\')',
				'route': '/'
			},
			'teams': {
				'caption': 'Teams',
				'onClick': 'changeRoute(\'teams\')',
				'route': '/teams'
			},
			'forecast': {
				'caption': 'Forecast',
				'onClick': 'changeRoute(\'forecast\')',
				'route': '/forecast',
				'role': 'connected'
			},
			'about': {
				'caption': 'About',
				'onClick': 'changeRoute(\'about\')',
				'route': '/about'
			},
			'connect': {
				'caption': $scope.getConnectionCaption(),
				'onClick': 'openConnectDialog'
			}
		};

		$scope.getMenuItems = function() {
			var thisMenu = [];
			var keys = Object.keys($scope.menu);
			for (var index in keys) {
				var key = keys[index];
				if ((!$scope.menu[key].role) || (($scope.menu[key].role) && (users.hasRole($scope.menu[key].role)))) {
					thisMenu.push($scope.menu[key]);
				}
			}
			return thisMenu;
		};

		$scope.getCurrentMenu = function() {
			for (var i in $scope.menu) {
				if ($scope.menu[i].route === $location.path()) {
					return i;
				}
			}
			return '';
		};

		$scope.notSorted = function(obj) {
			if (!obj) {
				return [];
			}
			return Object.keys(obj);
		};

		$scope.changeRoute = function(key) {
			$location.path($scope.menu[key].route);
		};

		$scope.openConnectDialog = function() {
			if (users.isConnected()) {
				users.logOut().then(function() {
					$scope.menu.connect.caption = $scope.getConnectionCaption();
					$scope.username = users.getName();
				}, function() {
					$scope.menu.connect.caption = $scope.getConnectionCaption();
					$scope.username = users.getName();
				});

			} else {
				var modalInstance = $modal.open({
					templateUrl: 'dialogs/connect.html',
					controller: 'ModalConnectCtrl',
					size: 'sm',
					resolve: {
						data: function() {
							return null;
						}
					}
				});

				modalInstance.result.then(function() {
					$scope.menu.connect.caption = $scope.getConnectionCaption();
					$scope.username = users.getName();
				}, function() {
					//$log.info('Modal dismissed at: ' + new Date());
				});
			}
		};

		$scope.$on('check-session', function() {
			console.log('recieved');
			$scope.menu.connect.caption = $scope.getConnectionCaption();
			$scope.username = users.getName();
		});

	}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('forecastMeNowApp').controller('ModalConnectCtrl', ['$scope', '$modalInstance', 'data', '$http', 'users', function($scope, $modalInstance, data, $http, users) {

	$scope.data = data;
	$scope.label = (users.isConnected() ? 'Disconnect' : 'Connect');
	$scope.connected = users.isConnected();
	$scope.connecting = false;

	$scope.ok = function() {
		$scope.connecting = true;
		users.logIn($scope.user, $scope.password).then(function() {
			$modalInstance.close(true);
		}, function() {
			$scope.connecting = false;
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);