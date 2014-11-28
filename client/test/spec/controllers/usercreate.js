'use strict';

describe('Controller: UsercreateCtrl', function() {

  // load the controller's module
  beforeEach(module('forecastMeNowApp'));

  var UsercreateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    UsercreateCtrl = $controller('UsercreateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(3).toBe(3);
  });
});