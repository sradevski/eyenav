module.exports = function TrackerGetRequest() {

  var category = 'tracker';
  var request = 'get';
  var values = [];

  this.addValues = function (array) {
    Array.prototype.push.apply(values, array); // fails if array very large
  };

  this.getMessage = function () {
    return {
      category: category,
      request: request,
      values: values
    };
  };
};
