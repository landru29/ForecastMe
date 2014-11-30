'use strict';

describe('Service: match', function () {

  // load the service's module
  beforeEach(module('forecastMeNowApp'));

  // instantiate service
  var match;
  beforeEach(inject(function (_match_) {
    match = _match_;
  }));

  it('should do something', function () {
    expect(!!match).toBe(true);
  });

});
