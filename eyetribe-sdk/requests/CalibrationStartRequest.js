module.exports = function CalibrationStartRequest(pointcount) {

  var category = 'calibration';
  var request = 'start';

  this.getMessage = function () {
    return {
      category: category,
      request: request,
      values: { pointcount: pointcount }
    };
  };
};
