'use strict';

describe('Service: parse', function() {

  // load the service's module
  beforeEach(module('forecastMeNow'));

  // instantiate service
  var parse;
  beforeEach(inject(function(_parse_) {
    parse = _parse_;
  }));

  it('should do something', function() {
    expect(!!parse).toBe(true);
  });

});