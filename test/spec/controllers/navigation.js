'use strict';

describe('Controller: NavigationCtrl', function() {

  // load the controller's module
  beforeEach(module('forecastMeNow'));

  var NavigationCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    NavigationCtrl = $controller('NavigationCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(Object.keys(scope.menu).length).toBe(3);
  });
});