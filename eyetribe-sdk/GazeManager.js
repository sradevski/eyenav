var extend = require('node.extend');
var Emitter = require('component-emitter');
var GazeResponseManager = require('./GazeResponseManager');
var HeartbeatHandler = require('./HeartbeatHandler');


/**
 * @usage new GazeManager()
 */
var GazeManager = function () {

  // Events
  //   calibrationStarted
  //   calibrationProgress
  //   calibrationProcessing
  //   calibrationResult
  //   calibrationChanged
  //   connected()
  //   disconnected(err)
  //   gazeUpdate (frame)
  //   trackerStateChanged
  //   screenStateChanged
  Emitter(this);
  this.addListener = this.on; // Alias
  this.removeListener = this.off; // Alias
  this.clearListeners = function () {
    this.off();
  };
  var this2 = this;

  var NOOP = function () {};

  var api = new GazeResponseManager();

  api.on('connected', function () {
    this2.emit('connected');
  });

  api.on('disconnected', function (err) {
    this2.emit('disconnected', err);
  });

  api.on('gazeUpdate', function (frame) {
    this2.emit('gazeUpdate', frame);
  });

  var heartbeatHandler = new HeartbeatHandler(api);

  // Failure handlers

  var handleConnectionFailure = function () {
    heartbeatHandler.stop();
  };

  this.activate = function (options, callback) {
    // Options
    //   apiVersion, default '1.0'
    //   clientMode, default 'push'
    //   hostname, default 'localhost'
    //   portnumber, default 6555
    // Callback
    //   err

    options = extend({
      apiVersion: 1,
      clientMode: 'push',
      hostname: 'localhost',
      portnumber: 6555
    }, options);

    if (typeof callback !== 'function') {
      callback = NOOP;
    }

    api.connect(options.hostname, options.portnumber, function (err) {
      if (err) {
        handleConnectionFailure();
        callback(new Error('Connection not established.'));
        return;
      }

      heartbeatHandler.start();

      var mode = options.clientMode;
      var vers = options.apiVersion;
      api.requestSetTracker(mode, vers, function (err, msg) {
        if (err) {
          callback(err, null);
          return;
        }
        api.requestAllStates(function (err, msg) {
          if (err) {
            callback(err, null);
            return;
          }
          callback(null);
        });
      });

    });
  };

  /**
   * @param {function} callback - No parameters. Called once on close.
   */
  this.deactivate = function (callback) {
    api.close(function () {
      callback();
    });
  };

  /**
   * @return Is the client connected to EyeTribe Server and initialized?
   */
  this.isActivated = function () {
    return api.isConnected();
  };

  this.isCalibrating = function () {
    throw new Error('Not yet implemented.');
  };

  this.isCalibrated = function () {
    throw new Error('Not yet implemented.');
  };

  this.getScreen = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, {
        index: msg.values.screenindex,
        resolution: {
          width: msg.values.screenresw,
          height: msg.values.screenresh
        },
        physical: {
          width: msg.values.screenpsyw,
          height: msg.values.screenpsyh
        }
      });
    });
  };

  this.getTrackerState = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, msg.values.trackerstate);
    });
  };

  this.getHeartbeatInterval = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, msg.values.heartbeatinterval);
    });
  };

  // Callback
  //   err
  //   calibresult, object
  this.getLastCalibrationResult = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, msg.values.calibresult);
    });
  };

  // Callback
  //   err
  //   framerate, integer
  this.getFrameRate = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, msg.values.framerate);
    });
  };

  this.getVersion = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      callback(null, msg.values.version);
    });
  };

  /**
   * Mode "push" or "pull"
   * @param callback(err, mode)
   */
  this.getClientMode = function (callback) {
    api.requestAllStates(function (err, msg) {
      if (err) { callback(err, null); return; }
      var mode = (msg.values.push ? 'push' : 'pull');
      callback(null, push);
    });
  };

  this.calibrate = function (options) {
    throw new Error('Not yet implemented.');
  };

  this.switchScreen = function (screenOptions, callback) {
    var s = screenOptions;
    api.requestScreenSwitch(s.index, s.resolution.width, s.resolution.height,
      s.physical.width, s.physical.height, function (err, msg) {
        if (err) { callback(err); return; }
        callback(null);
      });
  };
};

module.exports = GazeManager;
