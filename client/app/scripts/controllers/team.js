'use strict';

/**
 * @ngdoc function
 * @name forecastMeNowApp.controller:TeamCtrl
 * @description
 * # TeamCtrl
 * Controller of the forecastMeNowApp
 */
angular.module('forecastMeNowApp')
	.controller('TeamCtrl', ['$scope', '$http', 'registry', '$modal', function($scope, $http, registry, $modal) {
		$scope.teams = [];
		$scope.pools = [];
		$scope.countryView = false;
		$scope.poolView = true;

		$scope.showPool = function() {
			$scope.countryView = false;
			$scope.poolView = true;
		};

		$scope.showCountry = function() {
			$scope.countryView = true;
			$scope.poolView = false;
		};

		$scope.loadTeams = function() {
			$http.get(registry.get('apiUrl') + '/team-collection').then(function(data) {
				if (data.data.status === 'ok') {
					$scope.teams = data.data.data;
				}
			}, function(err) {
				console.log(err);
			});
		};

		$scope.loadPools = function() {
			$http.get(registry.get('apiUrl') + '/pool-collection').then(function(data) {
				if (data.data.status === 'ok') {
					$scope.pools = data.data.data;
					console.log($scope.pools);
				}
			}, function(err) {
				console.log(err);
			});
		};

		$scope.detail = function(team) {
			console.log(team);
			$modal.open({
				templateUrl: 'dialogs/team.html',
				controller: 'ModalTeamCtrl',
				/*size: 'lg',*/
				resolve: {
					data: function() {
						return team;
					}
				}
			});

		};

		$scope.loadPools();
		$scope.loadTeams();
	}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('forecastMeNowApp').controller('ModalTeamCtrl', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {

	$scope.team = data;

	$scope.close = function() {
		$modalInstance.dismiss('cancel');
	};
}]);