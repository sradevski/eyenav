module.exports = function HeartbeatHandler(gazeResponseManager) {
  var api = gazeResponseManager;
  var intervalId = null;
  var INTERVAL = 2000;

  this.start = function () {
    if (intervalId !== null) {
      this.stop();
    }
    setInterval(function () {
      api.requestHeartbeat();
    }, INTERVAL);
  };

  this.stop = function () {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};
