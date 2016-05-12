var _ = require('lodash');
var Emitter = require('component-emitter');
var GazeApiManager = require('./GazeApiManager');

/**
 * Response types
 *   gazeUpdate
 *   allStates
 *   setValues
 *   heartbeat
 *   calibrationStart
 *   calibrationPointStart
 *   calibrationPointEnd
 *   calibrationAbort
 *   calibrationClear
 *
 * Special response types
 *   error - Well-formatted error message
 *   unknown - Ill-formatted message
 */
var messageToResponseType = function (msg) {
  var U = 'unknown';
  var E = 'error';
  if (msg.hasOwnProperty('statuscode')) {
    if (msg.statuscode === 200) {
      if (msg.hasOwnProperty('category')) {
        if (msg.category === 'tracker') {
          if (msg.hasOwnProperty('request')) {
            if (msg.request === 'get') {
              if (msg.hasOwnProperty('values')) {
                if (msg.values.hasOwnProperty('frame')) {
                  return 'gazeUpdate';
                } else {
                  return 'allStates';
                }
              } else {
                return U; // is empty get possible?
              }
            } else if (msg.request === 'set') {
              return 'setValues';
            } else {
              return U;
            }
          } else {
            // At least the pushed frames do not have requestType
            if (msg.hasOwnProperty('values')) {
              if (msg.values.hasOwnProperty('frame')) {
                return 'gazeUpdate';
              } else {
                return U;
              }
            } else {
              return U;
            }
          }
        } else if (msg.category === 'calibration') {
          if (msg.hasOwnProperty('request')) {
            if (msg.request === 'start') {
              return 'calibrationStart';
            } else if (msg.request === 'pointstart') {
              return 'calibrationPointStart';
            } else if (msg.request === 'pointend') {
              return 'calibrationPointEnd';
            } else if (msg.request === 'abort') {
              return 'calibrationAbort';
            } else if (msg.request === 'clear') {
              return 'calibrationClear';
            } else {
              return U;
            }
          } else {
            return U;
          }
        } else if (msg.category === 'heartbeat') {
          return 'heartbeat';
        } else {
          return U;
        }
      } else {
        return U;
      }
    } else {
      // statuscode not 200
      if (msg.hasOwnProperty('values')) {
        if (msg.values.hasOwnProperty('statusmessage')) {
          return E;
        } else {
          return U;
        }
      } else {
        return U;
      }
    }
  } else {
    return U;
  }
};


/**
 * Purpose of GazeResponseManager is to abstract communication to
 * connected requests and resoponses to provide a callback api typical
 * to async JavaScript.
 *
 * Emits
 *   connected(null)
 *   disconnected(err)
 */
var GazeResponseManager = function () {
  Emitter(this);
  var this2 = this;

  var NOOP = function () {};

  // ResponseHandlers that wait for responses.
  // This is done to prevent errors if two messages switch place
  // responseType -> list of handlers
  var queues = {
    setValues: [],
    allStates: [],
    calibrationStart: [],
    calibrationPointStart: [],
    calibrationPointEnd: [],
    calibrationAbort: [],
    calibrationClear: []
  };

  var api = new GazeApiManager();

  api.on('connected', function () {
    this2.emit('connected');
  });

  api.on('disconnected', function (err) {
    var err2;
    if (err) {
      err2 = new Error('Connection with the Tracker was lost.');
    } else {
      err2 = new Error('Client disconnected.');
    }

    _.forOwn(queues, function (queue, responseType) {
      // first to last, oldest to most recent
      _.forEach(queue, function (handler) {
        handler(err2, null);
      });
      // Clear
      queues[responseType] = [];
    });

    this2.emit('disconnected', err);
  });

  api.on('response', function (err, msg) {
    if (err) {
      // Invalid message format.
      console.error('Unknown response format:', msg);
      return;
    }

    var handlers, oldestHandler;
    var responseType = messageToResponseType(msg);

    if (responseType === 'heartbeat') {
      // Heartbeat response, do nothing
    } else if (responseType === 'gazeUpdate') {
      this2.emit('gazeUpdate', msg.values.frame);
    } else if (responseType === 'unknown') {
      console.error('Unknown response format:', msg);
    } else if (responseType === 'error') {
      console.error(msg.values.statusmessage, msg);
    } else {
      if (!queues.hasOwnProperty(responseType)) {
        console.error('ResponseType without queue entry:', responseType);
        console.error(msg);
      } else {
        handlers = queues[responseType];
        if (handlers.length > 0) {
          oldestHandler = handlers.shift(); // Removes the first
          oldestHandler(null, msg); // err, msg
        } else {
          // Empty queue, do nothing
        }
      }
    }
  });


  this.requestSetTracker = function (clientMode, apiVersion, onResponse) {
    queues.setValues.push(onResponse); // May collide with screen value set.
    api.requestSetTracker(clientMode, apiVersion);
  };

  this.requestAllStates = function (onResponse) {
    queues.allStates.push(onResponse);
    api.requestAllStates();
  };

  this.requestHeartbeat = function () {
    api.requestHeartbeat();
    // no queue
  };

  this.requestCalibrationStart = function (pointcount, onResponse) {
    queues.calibrationStart.push(onResponse);
    api.requestCalibrationStart(pointcount);
  };

  this.requestCalibrationPointStart = function (x, y, onResponse) {
    queues.calibrationPointStart.push(onResponse);
    api.requestCalibrationPointStart(x, y);
  };

  this.requestCalibrationPointEnd = function (onResponse) {
    queues.calibrationPointEnd.push(onResponse);
    api.requestCalibrationPointEnd();
  };

  this.requestCalibrationAbort = function (onResponse) {
    queues.calibrationAbort.push(onResponse);
    api.requestCalibrationAbort();
  };

  this.requestCalibrationClear = function (onResponse) {
    queues.calibrationClear.push(onResponse);
    api.requestCalibrationClear();
  };

  this.requestScreenSwitch = function (screenIndex, screenResW,
    screenResH, screenPsyW, screenPsyH, onResponse) {
    queues.setValues.push(onResponse); // May collide with setTracker set.
    api.requestScreenSwitch(screenIndex, screenResW, screenResH,
      screenPsyW, screenPsyH);
  };

  /**
   * @param {function} onConnect - function (connected)
   */
  this.connect = function (host, port, onConnect) {
    return api.connect(host, port, onConnect);
  };

  /**
   * @param {function} onClosed - function ()
   */
  this.close = function (onClosed) {
    return api.close(onClosed);
  };

  this.isConnected = function () {
    return api.isConnected();
  };

};

module.exports = GazeResponseManager;
