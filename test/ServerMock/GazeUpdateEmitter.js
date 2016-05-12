var protocol = require('../../lib/protocol');
var Emitter = require('component-emitter');

module.exports = function GazeUpdateEmitter(fps) {
  Emitter(this);
  var that = this;

  var interval = null;

  var emit = function () {
    if (that.isStarted) {
      that.emit('gazeUpdate', {
        "timestamp": '2015-05-26 09:28:46.628',
        "time": Date.now(), // timestamp in milliseconds
        "fix": true, // is fixated?
        "state": 3, // 32bit masked state integer
        "raw": {
            "x": 600,
            "y": 400
        },
        "avg": {
            "x": 600,
            "y": 400
        }
      });
    }
  };

  this.start = function () {
    if (interval === null) {
      interval = setInterval(emit, Math.floor(1000/fps));
    }
  };

  this.stop = function () {
    clearInterval(interval);
    interval = null;
  };

  this.isStarted  = function () {
    return (interval !== null);
  };
};
