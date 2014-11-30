'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:ForecastCtrl
 * @description
 * # ForecastCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('ForecastCtrl', ['$scope', '$http', 'registry', 'users', '$q', 'match', function($scope, $http, registry, users, $q, match) {
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

		$scope.alert = null;

		$scope.closeAlert = function() {
			$scope.alert = null;
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
			match.getForecastedMatches().then(function(data) {
				$scope.matches = data;
			}, function(err) {
				$scope.alert = {
					type: 'danger',
					message: err
				};
			});
		};

		$scope.save = function(thisMatch) {
			match.saveForecast(thisMatch).then(function(response) {
				$scope.alert = {
					type: 'success',
					message: response
				};
			}, function(err) {
				$scope.alert = {
					type: 'danger',
					message: err
				};
			});
		};

		$scope.getMatches();

	}]);