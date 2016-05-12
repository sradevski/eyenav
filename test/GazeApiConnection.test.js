/*jshint expr: true*/ // prevent error in ...be.a.Function
var should = require('should');
var ServerMock = require('./ServerMock');
var GazeApiConnection = require('../lib/GazeApiConnection');

var HOST = 'localhost';
var PORT = 6555;
var NOOP = function () {};

describe('GazeApiConnection', function () {

  var gazecon, servermock;

  beforeEach(function (done) {
    gazecon = new GazeApiConnection();
    servermock = new ServerMock(PORT, function onListen() {
      done();
    });
  });

  afterEach(function (done) {
    gazecon.off();
    gazecon.close(function () {
      servermock.close(function (err) {
        if (err) { console.error(err); throw err; }
        done();
      });
    });
  });

  describe('#connect', function () {

    it('should be a function', function () {
      gazecon.should.have.property('connect');
      (gazecon.connect).should.be.a.Function;
    });

    it('should establish a connection with the server', function (done) {
      var flag = false;
      gazecon.on('connected', function () {
        flag = true;
      });

      servermock.getNumConnections(function (numConnections) {
        numConnections.should.equal(0);
        gazecon.connect(HOST, PORT, function (err) {
          should(err).equal(null);
          flag.should.equal(true);
          servermock.getNumConnections(function (numConnections) {
            numConnections.should.equal(1);
            done();
          });
        });
      });
    });

    it('should give error if not connected', function () {
      var flag = 0;
      gazecon.on('connected', function () {
        flag += 1;
      });
      gazecon.on('disconnected', function () {
        flag += 2;
      });

      servermock.close(function () {
        gazecon.connect(HOST, PORT, function (err) {
          should(err).not.equal(null);
          gazecon.isConnected().should.equal(false);
          flag.should.equal(0); // no events fired
          done();
        });
      });
    });
  });

  describe('#close', function () {
    it('closes the connection to the server', function (done) {
      var flag = 0;
      gazecon.on('disconnected', function () {
        flag += 1;
      });
      gazecon.connect(HOST, PORT, function (err) {
        should(err).equal(null);
        servermock.getNumConnections(function (num) {
          num.should.equal(1);
          gazecon.close(function () {
            flag.should.equal(1);
            servermock.getNumConnections(function (num) {
              num.should.equal(0);
              done();
            });
          });
        });
      });
    });

    it('calls back even when there is no connection', function (done) {
      gazecon.close(function (nothing) {
        (typeof nothing === 'undefined').should.be.True;
        done();
      });
    });
  });

  describe('#isConnected', function () {
    it('should tell the state of connection', function (done) {
      gazecon.isConnected().should.be.False;
      gazecon.connect(HOST, PORT, function () {
        gazecon.isConnected().should.be.True;
        done();
      });
    });
  });

  describe('#request', function () {

    beforeEach(function (done) {
      gazecon.connect(HOST, PORT, function () {
        done();
      });
    });

    it('should send a message object', function (done) {
      gazecon.on('response', function (err, msg) {
        should(err).equal(null);
        msg.should.be.eql({
          'category': 'tracker',
          'request': 'get',
          'statuscode': 200,
          'values': {
            'version': 1,
            'push': false,
            'framerate': 30
          }
        });
        done();
      });

      var req = {
        category: 'tracker',
        request: 'get',
        values: ['version', 'push', 'framerate']
      };
      gazecon.sendRequest(req);
    });

    it('should cause response with error', function (done) {
      gazecon.on('response', function (err, msg) {
        should(err).not.equal(null);
        msg.should.equal('gibberish{}');
        done();
      });
      gazecon.sendRequest({
        category: 'debug',
        request: 'echo',
        values: 'gibberish{}'
      });
    });
  });

});
