module.exports = function CalibrationPointStartRequest(x, y) {

  var category = 'calibration';
  var request = 'pointstart';

  this.getMessage = function () {
    return {
      category: category,
      request: request,
      values: { x: x, y: y }
    };
  };
};
