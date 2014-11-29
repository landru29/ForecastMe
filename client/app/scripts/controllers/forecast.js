'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:ForecastCtrl
 * @description
 * # ForecastCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('ForecastCtrl', ['$scope', '$http', 'registry', 'users', function($scope, $http, registry, users) {
		$scope.matches = [];
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

		$scope.getTeamName = function(teamObj) {
			if (typeof teamObj === 'string') {
				return teamObj;
			} else {
				return teamObj.name;
			}
		};

		$scope.getTeamClass = function(teamObj) {
			if (typeof teamObj === 'string') {
				return null;
			} else {
				return teamObj.country.class;
			}
		};

		$scope.getTeamImg = function(teamObj) {
			if (typeof teamObj === 'string') {
				return null;
			} else {
				return teamObj.icon;
			}
		};

		$scope.getMatches = function() {
			$http.get(registry.get('apiUrl') + '/match-collection/?key=' + users.getKey())
				.then(function(response) {
					if (response.data.status === 'ok') {
						$scope.matches = [];
						var keys = Object.keys(response.data.data);
						for (var i in keys) {
							$scope.matches.push({
								groupName: keys[i],
								matches: response.data.data[keys[i]]
							});
						}
					} else {
						$scope.matches = {};
					}
				}, function() {

				});
		};

		$scope.getMatches();

	}]);