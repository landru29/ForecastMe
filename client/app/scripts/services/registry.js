'use strict';

/**
 * @ngdoc service
 * @name forecastMeNowApp.registry
 * @description
 * # registry
 * Provider in the forecastMeNow.
 */
angular.module('forecastMeNowApp')
  .provider('registry', function() {

    // Private variables
    var registryData = {};


    function Greeter() {
      this.set = function(key, value) {
        registryData[key] = value;
      };
      this.get = function(key) {
        return registryData[key];
      };
    }

    // Public API for configuration
    this.set = function(key, value) {
      registryData[key] = value;
    };

    this.get = function(key) {
      return registryData[key];
    };

    // Method for instantiating
    this.$get = function() {
      return new Greeter();
    };
  });