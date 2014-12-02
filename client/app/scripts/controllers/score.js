'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:ScoreCtrl
 * @description
 * # ScoreCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('ScoreCtrl', ['$scope', '$http', 'registry', 'users', '$q', 'match', function($scope, $http, registry, users, $q, match) {
		$scope.matches = [];

		$scope.alert = null;

		$scope.closeAlert = function() {
			$scope.alert = null;
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
			match.getMatches().then(function(data) {
				$scope.matches = data;
			}, function(err) {
				$scope.alert = {
					type: 'danger',
					message: err
				};
			});
		};

		$scope.save = function(thisMatch) {
			match.saveScore(thisMatch).then(function(response) {
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