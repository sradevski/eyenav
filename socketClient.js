(function () {
  'use strict';

  var WebSocket = require('ws');

  var _domainManager,
    DOMAIN_NAME = 'socketDomain';

  var ws,
    startTrackerAfterConnecting = false;


  //Note: Each Gaze entry should come with a state field denoting the state of the gaze. I am using the states from EyeTribe as a basis, and each server should implement the same states. Tracking Gaze: 1, Not Tracking: 2, Everything else: 10

  //Future: Check whether the server sends gaze data or some message, command, etc. 
  function isGazeData (serverData) {
    return true;
  }

  function isSocketRunning () {
    return ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING);
  }

  function setSocketEventHandlers () {
    if (isSocketRunning()) {
      ws.on('open', function () {
        _domainManager.emitEvent(DOMAIN_NAME, 'trackerConnected');
        if (startTrackerAfterConnecting) {
          ws.send('startTracker');
        }
      });

      ws.on('close', function () {
        _domainManager.emitEvent(DOMAIN_NAME, 'trackerDisconnected');
      });

      ws.on('message', function (serverMessage, flags) {
        var serverDataObject = JSON.parse(serverMessage);
        if (isGazeData(serverDataObject)) {
          _domainManager.emitEvent(DOMAIN_NAME, 'gazeChanged', serverDataObject);
        }
      });
    } 
  }

  function startServer (port, ipAddress) {
    if (!ws || (ws.readyState !== WebSocket.CONNECTING && ws.readyState !== WebSocket.OPEN)) {
      ws = new WebSocket('ws://' + ipAddress + ':' + port);
      setSocketEventHandlers();
    }
  }

  function start (port, ipAddress) {
    if (!isSocketRunning()) {
      startServer(port, ipAddress);
      startTrackerAfterConnecting = true;
    } else {
      ws.send('startTracker');
    }
  }

  function stop () {
    if (isSocketRunning()) {
      ws.send('stopTracker');
      ws.close(1000, "Done tracking. Bye bye");
    }
  }

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

    domainManager.registerEvent(DOMAIN_NAME, 'trackerDisconnected', []);

    domainManager.registerEvent(DOMAIN_NAME, 'gazeChanged', [{
      name: 'gazeData',
      type: 'object'
    }]);
  }

  exports.init = init;
}());