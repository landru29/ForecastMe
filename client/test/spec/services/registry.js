'use strict';

describe('Service: registry', function() {

  // load the service's module
  beforeEach(module('forecastMeNowApp'));

  // instantiate service
  var registry;
  beforeEach(inject(function(_registry_) {
    registry = _registry_;
  }));

  it('should do something', function() {
    expect(!!registry).toBe(true);
  });

});