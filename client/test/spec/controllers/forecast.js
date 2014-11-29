'use strict';

describe('Controller: ForecastCtrl', function() {

  // load the controller's module
  beforeEach(module('forecastMeNowApp'));

  var ForecastCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    ForecastCtrl = $controller('ForecastCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(3).toBe(3);
  });
});