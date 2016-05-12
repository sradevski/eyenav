var protocol = require('../../lib/protocol');
var Emitter = require('component-emitter');
var GazeUpdateEmitter = require('./GazeUpdateEmitter');
var _ = require('lodash');

/**
 * Mock of the tracker device
 */

var Tracker = function () {
  Emitter(this);
  var this2 = this;

  var running = false;
  var gazeUpdateEmitter = new GazeUpdateEmitter();

  gazeUpdateEmitter.on('gazeUpdate', function (frame) {
    if (running) {
      this2.emit('gazeUpdate', frame);
    }
  });

  var state = {
    push: false,
    heartbeatinterval: protocol.DEFAULT_HEARTBEAT_INTERVAL,
    version: protocol.VERSION,
    trackerstate: protocol.TRACKER_NOT_CONNECTED,
    framerate: 30,
    iscalibrated: false,
    iscalibrating: false,
    calibresult: {
      "result": true,
      "deg": 2.5,
      "degl": 2.3,
      "degr": 2.7,
      "calibpoints": []
    },
    frame: {},
    screenindex: 1,
    screenresw: 640,
    screenresh: 480,
    screenpsyw: 0.32,
    screenpsyh: 0.24
  };

  this.get = function (key) {
    if (state.hasOwnProperty(key)) {
      return state[key];
    }
  };

  this.set = function (obj) {
    // See valid keys to set http://dev.theeyetribe.com/api/#cat_tracker
    var validSubset = _.pick(obj, [
      protocol.TRACKER_SCREEN_INDEX,
      protocol.TRACKER_SCREEN_RESOLUTION_WIDTH,
      protocol.TRACKER_SCREEN_RESOLUTION_HEIGHT,
      protocol.TRACKER_SCREEN_PHYSICAL_WIDTH,
      protocol.TRACKER_SCREEN_PHYSICAL_HEIGHT,
      protocol.TRACKER_VERSION,
      protocol.TRACKER_MODE_PUSH
    ]);

    // Value validation here...

    // Assign new values ("extend")
    _.assign(state, validSubset);

    if (running) {
      if (state.push) {
        gazeUpdateEmitter.start();
      } else {
        gazeUpdateEmitter.stop();
      }
    }
  };

  // Allow emitting of events
  this.start = function () {
    running = true;

    if (state.push) {
      gazeUpdateEmitter.start();
    }
  };

  // Stop emitting events
  this.stop = function () {
    running = false;
    gazeUpdateEmitter.stop();
  };
};

module.exports = Tracker;
