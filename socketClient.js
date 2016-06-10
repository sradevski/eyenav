(function () {
  'use strict';
  var WebSocket = require('ws');

  var _domainManager = null,
    DOMAIN_NAME = 'eyeNav';

  var ipAddress = '127.0.0.1',
    port = '8887',
    ws,
    startTrackerAfterConnecting = false;

  
  //Note: Current commands that the server understands are "startTracker" and "stopTracker". This should be extended accordingly to the needs.
  //Note: Each Gaze entry should come with a state field denoting the state of the gaze. I am using the states from EyeTribe as a basis, and each server should implement the same states. TrackingGaze: 1, TrackingEyes: 2, TrackingPresence: 4, TrackingFail: 8, TrackingLost: 16
  
  var isValidGazeData = function (gazeData) {
    if (gazeData.state === 8 || gazeData.state === 16) {
      return false;
    }

    return true;
  };

  var isSocketRunning = function () {
    return ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING);
  };

  var setSocketEventHandlers = function () {
    if (isSocketRunning()) {
      //ToDo: Handle each event accordingly in the extension side.
      ws.on('open', function () {
        _domainManager.emitEvent(DOMAIN_NAME, 'trackerConnected');
        if (startTrackerAfterConnecting) {
          ws.send('startTracker');
        }
      });

      ws.on('onclose', function (code, message) {
        _domainManager.emitEvent(DOMAIN_NAME, 'trackerDisconnected', code, message);
      });

      ws.on('message', function (serverMessage, flags) {
        var serverDataObject = JSON.parse(serverMessage);
        if (isValidGazeData(serverDataObject)) {
          _domainManager.emitEvent(DOMAIN_NAME, 'gazeChanged', serverDataObject);
        }
      });

      ws.on('onerror', function (err) {
        _domainManager.emitEvent(DOMAIN_NAME, 'serverError', err);
      });
    } else {
      _domainManager.emitEvent(DOMAIN_NAME, 'serverError', {
        type: 'user-defined',
        error: 'Socket is not open. Please make sure that the server is running.'
      });
    }
  };

  var startServer = function () {
    if (!ws || (ws.readyState !== WebSocket.CONNECTING && ws.readyState !== WebSocket.OPEN)) {
      ws = new WebSocket('ws://' + ipAddress + ':' + port);
      setSocketEventHandlers();
    }
  };

  var start = function () {
    if (!isSocketRunning()) {
      startServer();
      startTrackerAfterConnecting = true;
    } else {
      ws.send('startTracker');
    }
  };

  var stop = function () {
    if (isSocketRunning()) {
      ws.send('stopTracker');
      ws.close(1000, "Done tracking. Bye bye");
    }
  };

  //This is how you export a module to be consumed in a brackets plugin
  function init(domainManager) {
    _domainManager = domainManager;

    if (!domainManager.hasDomain(DOMAIN_NAME)) {
      domainManager.registerDomain(DOMAIN_NAME, {
        major: 0,
        minor: 1
      });
    }

    domainManager.registerCommand(
      DOMAIN_NAME, // domain name
      'start', // command name
      start, // command handler function
      false, // this command is synchronous in Node
      'Starts the eyeNav Tool', [], []);

    domainManager.registerCommand(DOMAIN_NAME, // domain name
      'stop', // command name
      stop, // command handler function
      false, // this command is synchronous in Node
      'Stops the eyeNav Tool', [], [{
        name: 'tester', // return values
        type: 'number',
        description: 'amount of memory in bytes'
      }]);

    domainManager.registerEvent(DOMAIN_NAME, 'trackerConnected', []);

    domainManager.registerEvent(DOMAIN_NAME, 'trackerDisconnected', [{
        name: 'code',
        type: 'Number'
    },
      {
        name: 'message',
        type: 'String'
      }]);

    domainManager.registerEvent(DOMAIN_NAME, 'serverError', [{
      name: 'err',
      type: 'object'
    }]);


    domainManager.registerEvent(DOMAIN_NAME, 'gazeChanged', [{
      name: 'gazeData',
      type: 'object'
    }]);
  }

  exports.init = init;
}());