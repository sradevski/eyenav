var Emitter = require('component-emitter');
var protocol = require('./protocol');
var GazeApiConnection = require('./GazeApiConnection');

var TrackerSetRequest = require('./requests/TrackerSetRequest');
var TrackerGetRequest = require('./requests/TrackerGetRequest');
var CalibrationStartRequest = require('./requests/CalibrationStartRequest');
var CalibrationPointStartRequest = require('./requests/CalibrationPointStartRequest');

/**
 * Purpose of GazeApiManager is to abstract requests to be sent to the tracker
 * server.
 *
 * Emits
 *   connected(null)
 *   disconnected(err)
 *   response(err, msg)
 */
var GazeApiManager = function () {
  Emitter(this);
  var this2 = this;

  var con = new GazeApiConnection();

  // Redirect events
  con.on('connected', function () {
    this2.emit('connected');
  });
  con.on('disconnected', function (err) {
    this2.emit('disconnected', err);
  });
  con.on('response', function (err, msg) {
    this2.emit('response', err, msg);
  });

  this.requestSetTracker = function (clientMode, apiVersion) {
    var req = new TrackerSetRequest();
    req.addValue(protocol.TRACKER_MODE_PUSH, (clientMode === 'push'));
    req.addValue(protocol.TRACKER_VERSION, apiVersion);
    con.sendRequest(req.getMessage());
  };

  this.requestAllStates = function () {
    var req = new TrackerGetRequest();
    req.addValues([
      protocol.TRACKER_HEARTBEATINTERVAL,
      protocol.TRACKER_ISCALIBRATED,
      protocol.TRACKER_ISCALIBRATING,
      protocol.TRACKER_TRACKERSTATE,
      protocol.TRACKER_SCREEN_INDEX,
      protocol.TRACKER_SCREEN_RESOLUTION_WIDTH,
      protocol.TRACKER_SCREEN_RESOLUTION_HEIGHT,
      protocol.TRACKER_SCREEN_PHYSICAL_WIDTH,
      protocol.TRACKER_SCREEN_PHYSICAL_HEIGHT,
      protocol.TRACKER_CALIBRATIONRESULT,
      protocol.TRACKER_FRAMERATE,
      protocol.TRACKER_VERSION,
      protocol.TRACKER_MODE_PUSH
    ]);
    con.sendRequest(req.getMessage());
  };

  this.requestCalibrationStates = function () {
    var req = new TrackerGetRequest();
    req.addValues([
      protocol.TRACKER_ISCALIBRATED,
      protocol.TRACKER_ISCALIBRATING,
      protocol.TRACKER_CALIBRATIONRESULT
    ]);
    con.sendRequest(req.getMessage());
  };

  this.requestScreenStates = function () {
    var req = new TrackerGetRequest();
    req.addValues([
      protocol.TRACKER_SCREEN_INDEX,
      protocol.TRACKER_SCREEN_RESOLUTION_WIDTH,
      protocol.TRACKER_SCREEN_RESOLUTION_HEIGHT,
      protocol.TRACKER_SCREEN_PHYSICAL_WIDTH,
      protocol.TRACKER_SCREEN_PHYSICAL_HEIGHT
    ]);
    con.sendRequest(req.getMessage());
  };

  this.requestTrackerState = function () {
    var req = new TrackerGetRequest();
    req.addValues([
      protocol.TRACKER_TRACKERSTATE,
      protocol.TRACKER_FRAMERATE
    ]);
    con.sendRequest(req.getMessage());
  };

  this.requestHeartbeat = function () {
    var msg = { category: protocol.CATEGORY_HEARTBEAT };
    con.sendRequest(msg);
  };

  this.requestCalibrationStart = function (pointcount) {
    var req = new CalibrationStartRequest(pointcount);
    con.sendRequest(req.getMessage());
  };

  this.requestCalibrationPointStart = function (x, y) {
    var req = new CalibrationPointStartRequest(x, y);
    con.sendRequest(req.getMessage());
  };

  this.requestCalibrationPointEnd = function () {
    con.sendRequest({
      category: protocol.CATEGORY_CALIBRATION,
      request: protocol.CALIBRATION_REQUEST_POINTEND
    });
  };

  this.requestCalibrationAbort = function () {
    con.sendRequest({
      category: protocol.CATEGORY_CALIBRATION,
      request: protocol.CALIBRATION_REQUEST_ABORT
    });
  };

  this.requestCalibrationClear = function () {
    con.sendRequest({
      category: protocol.CATEGORY_CALIBRATION,
      request: protocol.CALIBRATION_REQUEST_CLEAR
    });
  };

  this.requestScreenSwitch = function (screenIndex, screenResW, screenResH, screenPsyW, screenPsyH) {
    var req = new TrackerSetRequest();
    req.addValues({
      screenindex: screenIndex,
      screenresw: screenResW,
      screenresh: screenResH,
      screenpsyw: screenPsyW,
      screenpsyh: screenPsyH
    });
    con.sendRequest(req.getMessage());
  };

  /**
   * @param {function} onConnect - function (connected)
   */
  this.connect = function (host, port, onConnect) {
    return con.connect(host, port, onConnect);
  };

  /**
   * @param {function} onClosed - function ()
   */
  this.close = function (onClosed) {
    return con.close(onClosed);
  };

  this.isConnected = function () {
    return con.isConnected();
  };

};

module.exports = GazeApiManager;
