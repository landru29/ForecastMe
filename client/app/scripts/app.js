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
  .module('forecastMeNowApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(['$routeProvider',
    'registryProvider',
    function($routeProvider, registryProvider) {
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

      registryProvider.set('apiUrl', 'http://localhost:3000/');
      /*parseProvider.setApiId('BVUAfb1sw3eTrz198EmacBkMJcT6soN2ttNzroaO');
      parseProvider.setApiKey('0q6aejp6bIo76xl9Rdis7Xr2i8ZqOaOIs7RFxshP');*/
    }
  ]);