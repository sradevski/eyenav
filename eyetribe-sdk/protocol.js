exports.VERSION = 1;

exports.DEFAULT_SERVER_HOST = "localhost";
exports.DEFAULT_SERVER_PORT = 6555;

exports.DEFAULT_HEARTBEAT_INTERVAL = 3000;

exports.STATUSCODE_CALIBRATION_UPDATE = 800;
exports.STATUSCODE_SCREEN_UPDATE = 801;
exports.STATUSCODE_TRACKER_UPDATE = 802;

exports.KEY_CATEGORY = "category";
exports.KEY_REQUEST = "request";
exports.KEY_VALUES = "values";
exports.KEY_STATUSCODE = "statuscode";
exports.KEY_STATUSMESSAGE = "statusmessage";

exports.CATEGORY_TRACKER = "tracker";
exports.CATEGORY_CALIBRATION = "calibration";
exports.CATEGORY_HEARTBEAT = "heartbeat";

exports.TRACKER_REQUEST_SET = "set";
exports.TRACKER_REQUEST_GET = "get";
exports.TRACKER_MODE_PUSH = "push";
exports.TRACKER_HEARTBEATINTERVAL = "heartbeatinterval";
exports.TRACKER_VERSION = "version";
exports.TRACKER_ISCALIBRATED = "iscalibrated";
exports.TRACKER_ISCALIBRATING = "iscalibrating";
exports.TRACKER_TRACKERSTATE = "trackerstate";
exports.TRACKER_CALIBRATIONRESULT = "calibresult";
exports.TRACKER_FRAMERATE = "framerate";
exports.TRACKER_FRAME = "frame";
exports.TRACKER_SCREEN_INDEX = "screenindex";
exports.TRACKER_SCREEN_RESOLUTION_WIDTH = "screenresw";
exports.TRACKER_SCREEN_RESOLUTION_HEIGHT = "screenresh";
exports.TRACKER_SCREEN_PHYSICAL_WIDTH = "screenpsyw";
exports.TRACKER_SCREEN_PHYSICAL_HEIGHT = "screenpsyh";

exports.CALIBRATION_REQUEST_START = "start";
exports.CALIBRATION_REQUEST_ABORT = "abort";
exports.CALIBRATION_REQUEST_POINTSTART = "pointstart";
exports.CALIBRATION_REQUEST_POINTEND = "pointend";
exports.CALIBRATION_REQUEST_CLEAR = "clear";
exports.CALIBRATION_CALIBRESULT = "calibresult";
exports.CALIBRATION_CALIBPOINTS = "calibpoints";
exports.CALIBRATION_POINT_COUNT = "pointcount";
exports.CALIBRATION_X = "x";
exports.CALIBRATION_Y = "y";

exports.FRAME_TIME = "time";
exports.FRAME_TIMESTAMP = "timestamp";
exports.FRAME_FIXATION = "fix";
exports.FRAME_STATE = "state";
exports.FRAME_RAW_COORDINATES = "raw";
exports.FRAME_AVERAGE_COORDINATES = "avg";
exports.FRAME_X = "x";
exports.FRAME_Y = "y";
exports.FRAME_LEFT_EYE = "lefteye";
exports.FRAME_RIGHT_EYE = "righteye";
exports.FRAME_EYE_PUPIL_SIZE = "psize";
exports.FRAME_EYE_PUPIL_CENTER = "pcenter";

exports.CALIBRESULT_RESULT = "result";
exports.CALIBRESULT_AVERAGE_ERROR_DEGREES = "deg";
exports.CALIBRESULT_AVERAGE_ERROR_LEFT_DEGREES = "degl";
exports.CALIBRESULT_AVERAGE_ERROR_RIGHT_DEGREES = "degr";
exports.CALIBRESULT_CALIBRATION_POINTS = "calibpoints";
exports.CALIBRESULT_STATE = "state";
exports.CALIBRESULT_COORDINATES = "cp";
exports.CALIBRESULT_X = "x";
exports.CALIBRESULT_Y = "y";
exports.CALIBRESULT_MEAN_ESTIMATED_COORDINATES = "mecp";
exports.CALIBRESULT_ACCURACIES_DEGREES = "acd";
exports.CALIBRESULT_ACCURACY_AVERAGE_DEGREES = "ad";
exports.CALIBRESULT_ACCURACY_LEFT_DEGREES = "adl";
exports.CALIBRESULT_ACCURACY_RIGHT_DEGREES = "adr";
exports.CALIBRESULT_MEAN_ERRORS_PIXELS = "mepix";
exports.CALIBRESULT_MEAN_ERROR_AVERAGE_PIXELS = "mep";
exports.CALIBRESULT_MEAN_ERROR_LEFT_PIXELS = "mepl";
exports.CALIBRESULT_MEAN_ERROR_RIGHT_PIXELS = "mepr";
exports.CALIBRESULT_STANDARD_DEVIATION_PIXELS = "asdp";
exports.CALIBRESULT_STANDARD_DEVIATION_AVERAGE_PIXELS = "asd";
exports.CALIBRESULT_STANDARD_DEVIATION_LEFT_PIXELS = "asdl";
exports.CALIBRESULT_STANDARD_DEVIATION_RIGHT_PIXELS = "asdr";

// Set when engine is calibrated and glint tracking successfully.
exports.STATE_TRACKING_GAZE = 1;
// Set when engine has detected eyes.
exports.STATE_TRACKING_EYES = 1 << 1;
// Set when engine has detected either face, eyes or glint.
exports.STATE_TRACKING_PRESENCE = 1 << 2;
// Set when tracking failed in the last process frame.
exports.STATE_TRACKING_FAIL = 1 << 3;
// Set when tracking has failed consecutively over a period of time
// defined by engine.
exports.STATE_TRACKING_LOST = 1 << 4;

// Tracker device is detected and working
exports.TRACKER_CONNECTED = 0;
// Tracker device is not detected
exports.TRACKER_NOT_CONNECTED = 1;
// Tracker device is detected but not working due to wrong/unsupported firmware
exports.TRACKER_CONNECTED_BADFW = 2;
// Tracker device is detected but not working due to unsupported USB host
exports.TRACKER_CONNECTED_NOUSB3 = 3;
// Tracker device is detected but not working due to no stream could be received
exports.TRACKER_CONNECTED_NOSTREAM = 4;
