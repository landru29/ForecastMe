'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:ForecastCtrl
 * @description
 * # ForecastCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('ForecastCtrl', function($scope) {
		$scope.menu = {
			myForecast: {
				caption: 'My forecast',
				active: true
			},
			results: {
				caption: 'Global results',
				active: false
			}
		};

		$scope.setMenu = function(element) {
			for (var i in $scope.menu) {
				$scope.menu[i].active = false;
			}
			if ($scope.menu[element]) {
				$scope.menu[element].active = true;
			}
		};

	});