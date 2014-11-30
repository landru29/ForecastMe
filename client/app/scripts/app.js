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
    'ui.bootstrap',
    'ngStorage'
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
        .when('/teams', {
          templateUrl: 'views/team.html',
          controller: 'TeamCtrl'
        })
        .when('/forecast', {
          templateUrl: 'views/forecast.html',
          controller: 'ForecastCtrl'
        })
        .when('/score', {
          templateUrl: 'views/score.html',
          controller: 'ScoreCtrl'
        })
        .when('/user-create/user/:user/key/:key/email/:email', {
          templateUrl: 'views/user-create.html',
          controller: 'UsercreateCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });

      var analyseUrl = function(URL) {
        var urlAnalyse = URL.match(/([^:]*):\/\/([\w\.]*)(:(\d*))?\/(.*)/);
        return {
          server: urlAnalyse[2],
          protocole: urlAnalyse[1],
          port: urlAnalyse[4],
          path: urlAnalyse[5],
          toString: function() {
            return (this.protocole ? this.protocole + '://' : 'http://') + this.server +
              (this.port ? ':' + this.port : '') +
              (this.path ? '/' + this.path : '');
          }
        };
      };

      var url = analyseUrl(window.location.toString());
      url.port = 3000;
      url.path = null;

      registryProvider.set('apiUrl', url.toString());
    }
  ]);