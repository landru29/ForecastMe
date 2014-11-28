'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:TeamCtrl
 * @description
 * # TeamCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('TeamCtrl', ['$scope', '$http', 'registry', function ($scope, $http, registry) {
		$scope.teams = [];
		$scope.pools = [];
		$scope.countryView = false;
		$scope.poolView = true;

		$scope.showPool = function () {
			$scope.countryView = false;
			$scope.poolView = true;
		};

		$scope.showCountry = function () {
			$scope.countryView = true;
			$scope.poolView = false;
		};

		$scope.loadTeams = function () {
			$http.get(registry.get('apiUrl') + '/team-collection').then(function (data) {
				if (data.data.status === 'ok') {
					$scope.teams = data.data.data;
				}
			}, function (err) {
				console.log(err);
			});
		};

		$scope.loadPools = function () {
			$http.get(registry.get('apiUrl') + '/pool-collection').then(function (data) {
				if (data.data.status === 'ok') {
					$scope.pools = data.data.data;
					console.log($scope.pools);
				}
			}, function (err) {
				console.log(err);
			});
		};

		$scope.detail = function (team) {
			console.log(team);
		}

		$scope.loadPools();
		$scope.loadTeams();
	}]);