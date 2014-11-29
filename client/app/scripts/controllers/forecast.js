'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:ForecastCtrl
 * @description
 * # ForecastCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('ForecastCtrl', ['$scope', '$http', 'registry', 'users', '$q', function($scope, $http, registry, users, $q) {
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
			var matchPromise = $http.get(registry.get('apiUrl') + '/match-collection/?key=' + users.getKey());
			var forecastPromise = $http.get(registry.get('apiUrl') + '/forecast-collection?key=' + users.getKey());

			matchPromise.then(function(response) {
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
				$scope.alert = {
					type: 'danger',
					message: 'Server error'
				};
			});
			forecastPromise.then(function(response) {
				$scope.forecasts = response.data.data;
			}, function() {
				$scope.alert = {
					type: 'danger',
					message: 'Server error'
				};
			});

			var getMatchByName = function(name) {
				for (var gp in $scope.matches) {
					for (var matchIndex in $scope.matches[gp].matches) {
						if ($scope.matches[gp].matches[matchIndex].name === name) {
							return $scope.matches[gp].matches[matchIndex];
						}
					}
				}
				return null;
			};

			$q.all([matchPromise, forecastPromise]).then(function() {
				for (var index in $scope.forecasts) {
					var match = getMatchByName($scope.forecasts[index].matchName);
					if (match) {
						var teamName0 = (typeof match.teams[0] === 'string' ? match.teams[0] : match.teams[0].country.code);
						if (teamName0 === $scope.forecasts[index].team0.teamName) {
							match.forecast0 = $scope.forecasts[index].team0.forecast;
							match.forecast1 = $scope.forecasts[index].team1.forecast;
						} else {
							match.forecast0 = $scope.forecasts[index].team1.forecast;
							match.forecast1 = $scope.forecasts[index].team0.forecast;
						}
					}
				}
				console.log($scope.matches);
				console.log($scope.forecasts);
			}, function() {});

		};

		$scope.save = function(match) {
			var forecast = {
				match: match.name,
				team0: {
					forecast: (match.forecast0 ? match.forecast0 : 0),
					teamName: (typeof match.teams[0] === 'string' ? match.teams[0] : match.teams[0].country.code)
				},
				team1: {
					forecast: (match.forecast1 ? match.forecast1 : 0),
					teamName: (typeof match.teams[1] === 'string' ? match.teams[1] : match.teams[1].country.code)
				}
			};
			$http.post(registry.get('apiUrl') + '/forecast', {
				key: users.getKey(),
				forecast: forecast
			}).then(function(response) {
				if ((response.data.status) && (response.data.status === 'ok')) {
					$scope.alert = {
						type: 'success',
						message: 'Forecast saved'
					};
				} else {
					$scope.alert = {
						type: 'danger',
						message: 'Can not update your forecast'
					};
				}
			}, function() {
				$scope.alert = {
					type: 'danger',
					message: 'Server error'
				};
			});
		};

		$scope.getMatches();

	}]);