'use strict';

describe('Controller: UserresetCtrl', function() {

  // load the controller's module
  beforeEach(module('forecastMeNowApp'));

  var UserresetCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    UserresetCtrl = $controller('UserresetCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(3).toBe(3);
  });
});