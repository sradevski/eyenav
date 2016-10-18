'use strict';

var WebSocket = require('ws'),
  startTrackerAfterConnecting = false,
  ws;

//Note: Each Gaze entry should come with a state field denoting the state of the gaze. Each server should implement the same states. Current states are: Tracking Gaze - 1, Not Tracking - 2, Everything else - 10

//Future: Check whether the server sends gaze data or some message, command, etc.
function isGazeData (serverData) {
  return true;
}

function isSocketRunning () {
  return ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING);
}

function setSocketEventHandlers (eventEmitter) {
  if (isSocketRunning()) {
    ws.on('open', function () {
      eventEmitter.emit('trackerConnected');
      if (startTrackerAfterConnecting) {
        ws.send('startTracker');
      }
    });

    ws.on('close', function () {
      eventEmitter.emit('trackerDisconnected');
    });

    ws.on('message', function (serverMessage, flags) {
      var serverDataObject = JSON.parse(serverMessage);
      if (isGazeData(serverDataObject)) {
        eventEmitter.emit('gazeChanged', serverDataObject);
      }
    });
  }
}

function startServer (port, ipAddress, eventEmitter) {
  if (!ws || (ws.readyState !== WebSocket.CONNECTING && ws.readyState !== WebSocket.OPEN)) {
    ws = new WebSocket('ws://' + ipAddress + ':' + port);
    setSocketEventHandlers(eventEmitter);
  }
}

function start (port, ipAddress, eventEmitter) {
  if (!isSocketRunning()) {
    startServer(port, ipAddress, eventEmitter);
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

exports.start = start;
exports.stop = stop;
