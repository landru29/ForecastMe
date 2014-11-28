'use strict';

describe('Controller: TeamCtrl', function () {

  // load the controller's module
  beforeEach(module('forecastMeNowApp'));

  var TeamCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TeamCtrl = $controller('TeamCtrl', {
      $scope: scope
    });
  }));

  it('should be ok', function () {
    expect(1).toBe(1);
  });
});