var Emitter = require('component-emitter');
var net = require('net');
var utils = require('./utils');
var rawDataToMessages = utils.rawDataToMessages;
var messageToRawData = utils.messageToRawData;

/**
 * Purpose of GazeApiConnection is to abstract connection and message logic.
 * GazeApiConnection does not consider the protocol; it understands things
 * only as incoming and outgoing message objects.
 *
 * Emits
 *   connected(null)
 *   disconnected(err)
 *   response(err, msg)
 */
var GazeApiConnection = function () {
  Emitter(this);
  var this2 = this;

  var NOOP = function () {};

  var socket = null;
  var isConnected = false;

  /**
   * @param host
   * @param port
   * @param {function} onConnect - function (err)
   */
  this.connect = function (host, port, onConnect) {
    if (typeof onConnect === 'undefined') { onConnect = NOOP; }

    var initConnection = function () {

      // Has onConnect callback been called.
      var isOnConnectCalled = false;

      socket = net.connect({ip: host, port: port}, function connected() {
        isConnected = true;
        this2.emit('connected');
        if (!isOnConnectCalled) {
          isOnConnectCalled = true;
          onConnect(null);
        }
      });

      socket.setEncoding('utf8');

      socket.on('data', function (rawData) {
        var msgs;

        try {
          msgs = rawDataToMessages(rawData);
        } catch (e) {
          this2.emit('response', e, rawData);
          return;
        }

        msgs.forEach(function (msg) {
          this2.emit('response', null, msg);
        });
      });

      socket.on('error', function (err) {
        isConnected = false;
        socket.destroy();
        this2.emit('disconnected', err);
        if (!isOnConnectCalled) {
          isOnConnectCalled = true;
          onConnect(err);
        }
      });

      socket.on('close', function (hadError) {
        if (hadError) {
          // Do nothing; let 'error' event handler do its job.
        } else {
          isConnected = false;
          this2.emit('disconnected', null);
          if (!isOnConnectCalled) {
            isOnConnectCalled = true;
            onConnect(null);
          }
        }
      });
    };

    if (this.isConnected()) {
      this.close(initConnection);
    } else {
      initConnection();
    }

  };

  /**
   * @param {function} onClosed - function ()
   */
  this.close = function (onClosed) {
    if (typeof onClosed === 'undefined') { onClosed = NOOP; }

    if (this.isConnected()) {
      socket.on('close', function (hadError) {
        // - Ignore hadError because user wants socket to be closed anyway.
        // - Note that default 'close' handler will be also fired.
        isConnected = false; // to ensure consistent state for onClosed
        onClosed();
      });
      socket.end(); // closes the socket
    } else {
      onClosed();
    }
  };

  this.isConnected = function () {
    return (socket !== null) && isConnected;
  };

  /**
   * @param {object} message
   */
  this.sendRequest = function (message) {
    if (this.isConnected()) {
      socket.write(messageToRawData(message));
    } else {
      // do nothing
    }
  };
};

module.exports = GazeApiConnection;
