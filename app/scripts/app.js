'use strict';

/**
 * @ngdoc overview
 * @name forecastMeNow
 * @description
 * # forecastMeNow
 *
 * Main module of the application.
 */
angular
  .module('forecastMeNow', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(['$routeProvider', 'parseProvider', function($routeProvider, parseProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    parseProvider.setApiId('BVUAfb1sw3eTrz198EmacBkMJcT6soN2ttNzroaO');
    parseProvider.setApiKey('0q6aejp6bIo76xl9Rdis7Xr2i8ZqOaOIs7RFxshP');
  }]);