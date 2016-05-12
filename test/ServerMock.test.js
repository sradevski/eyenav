/*jshint expr: true*/ // prevent error in ...be.a.Function
var should = require('should');
var ServerMock = require('./ServerMock');

describe('ServerMock', function () {

  var servermock;

  beforeEach(function (done) {
    servermock = new ServerMock(6555, function onListen() {
      done();
    });
  });

  afterEach(function (done) {
    servermock.close(function (err) {
      if (err) { console.error(err); throw err; }
      done();
    });
  });

  it('should have zero connections', function (done) {
    servermock.getNumConnections(function (num) {
      num.should.equal(0);
      done();
    });
  });

});
