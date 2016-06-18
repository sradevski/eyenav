(function () {
  'use strict';

  var WebSocket = require('ws');

  var _domainManager = null,
    DOMAIN_NAME = 'socketDomain';

  var ws,
    startTrackerAfterConnecting = false;


  //Note: Current commands that the server understands are "startTracker" and "stopTracker". This should be extended accordingly to the needs.
  //Note: Each Gaze entry should come with a state field denoting the state of the gaze. I am using the states from EyeTribe as a basis, and each server should implement the same states. Tracking Gaze: 1, Not Tracking: 2, Everything else: 10

  var isValidGazeData = function (gazeData) {
    if (gazeData.state === 1) {
      return true;
    }

    return false;
  };

  var isSocketRunning = function () {
    return ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING);
  };

  var setSocketEventHandlers = function () {
    if (isSocketRunning()) {
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

  var startServer = function (port, ipAddress) {
    if (!ws || (ws.readyState !== WebSocket.CONNECTING && ws.readyState !== WebSocket.OPEN)) {
      ws = new WebSocket('ws://' + ipAddress + ':' + port);
      setSocketEventHandlers();
    }
  };

  var start = function (port, ipAddress) {
    if (!isSocketRunning()) {
      startServer(port, ipAddress);
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
      'Starts the eyeNav Tool', [{
          name: "port",
          type: "number",
          description: "The port of the websocket server"
      },
        {
          name: "ipAddress",
          type: "string",
          description: "The ip address of the websocket server"
        }], []);

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
    }, {
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