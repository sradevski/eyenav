var utils = require('../../lib/utils');
var rawDataToMessages = utils.rawDataToMessages;
var messageToRawData = utils.messageToRawData;
var Response = require('./Response');
var Tracker = require('./Tracker');

var tracker = new Tracker();

/**
 * @param {socket} A connected socket.
 */
var socketHandler = function (socket) {

  socket.setEncoding('utf8');
  tracker.start();

  var sendResponse = function (message) {
    socket.write(messageToRawData(message));
  };

  var handleMessage = function (message) {
    var res;
    if (message.category === 'tracker') {
      if (message.request === 'get') {
        res = new Response('tracker', 'get', 200);
        message.values.forEach(function (key) {
          res.addValue(key, tracker.get(key));
        });
        sendResponse(res.getMessage());
      } else if (message.request === 'set') {
        tracker.set(message.values);
        res = new Response('tracker', 'set', 200);
        sendResponse(res.getMessage());
      }
    } else if (message.category === 'calibration') {
      console.error('ServerMock: category "calibration" not yet implemented.');
    } else if (message.category === 'heartbeat') {
      // Do nothing
    } else if (message.category === 'debug') {
      if (message.request === 'echo') {
        if (message.hasOwnProperty('values')) {
          socket.write(message.values); // Send raw
        } else {
          console.error('ServerMock.socketHandler: unknown debug request');
        }
      } else {
        console.error('ServerMock.socketHandler: unknown debug request');
      }
    }
  };

  tracker.on('gazeUpdate', function (frame) {
    sendResponse({
      "category": "tracker",
      "statuscode": 200,
      "values": {
        "frame": frame
      }
    });
  });

  socket.on('data', function (rawData) {
    var msgs = rawDataToMessages(rawData);
    msgs.forEach(handleMessage);
  });

  socket.on('end', function () {
    tracker.stop();
  });

  socket.on('error', function () {
    tracker.stop();
  });

  socket.on('close', function (hadError) {
    tracker.stop();
  });
};

module.exports = socketHandler;
