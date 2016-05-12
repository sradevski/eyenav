/*jshint expr: true*/ // prevent error in ...be.a.Function
var should = require('should');
var ServerMock = require('./ServerMock');
var GazeApiManager = require('../lib/GazeApiManager');

var HOST = 'localhost';
var PORT = 6555;
var NOOP = function () {};

describe('GazeApiManager', function () {
  var apiman, servermock;

  beforeEach(function (done) {
    apiman = new GazeApiManager();
    servermock = new ServerMock(PORT, function onListen() {
      done();
    });
  });

  afterEach(function (done) {
    apiman.off();
    apiman.close(function () {
      servermock.close(function (err) {
        if (err) { console.error(err); throw err; }
        done();
      });
    });
  });

  describe('#connect', function () {
    it('should establish a connection with the server', function (done) {

      apiman.on('connected', function () {
        apiman.isConnected().should.be.True;
        servermock.getNumConnections(function (num) {
          num.should.equal(1);
          done();
        });
      });

      servermock.getNumConnections(function (num) {
        num.should.equal(0);
        apiman.connect(HOST, PORT);
      });
    });
  });

  describe('#close', function () {
    it('should close the connection to the server', function (done) {

      apiman.connect(HOST, PORT, function (err) {
        should(err).equal(null);

        apiman.on('disconnected', function (err) {
          should(err).equal(null);
          apiman.isConnected().should.equal(false);
          servermock.getNumConnections(function (num) {
            num.should.equal(0);
            done();
          });
        });

        servermock.getNumConnections(function (num) {
          num.should.equal(1);
          apiman.close();
        });
      });
    });

  });

  describe('#isConnected', function () {
    it('should tell the state of connection', function (done) {
      apiman.isConnected().should.equal(false);
      apiman.connect(HOST, PORT, function () {
        apiman.isConnected().should.equal(true);
        done();
      });
    });
  });

  describe('#requestSetTracker', function () {

    beforeEach(function (done) {
      apiman.connect(HOST, PORT, function () {
        done();
      });
    });

    it('should set tracker values', function (done) {

      apiman.on('response', function (err, msg) {
        should(err).equal(null);
        msg.should.be.eql({
          'category': 'tracker',
          'request': 'set',
          'statuscode': 200
        });
        done();
      });
      apiman.requestSetTracker('pull', 1);
    });
  });

  describe('#requestAllStates', function () {

    beforeEach(function (done) {
      apiman.connect(HOST, PORT, function () {
        done();
      });
    });

    it('should get all state values', function (done) {
      apiman.on('response', function (err, msg) {
        should(err).equal(null);
        msg.should.have.properties('category', 'request', 'values');
        msg.values.should.have.properties('push', 'iscalibrated', 'version');
        done();
      });
      apiman.requestAllStates();
    });
  });

});
