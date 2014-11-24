'use strict';

/**
 * @ngdoc function
 * @name forecastMeNow.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the forecastMeNow
 */
angular.module('forecastMeNow')
	.controller('AboutCtrl', function($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
	});