var extend = require('extend');

module.exports = function TrackerSetRequest() {

  var category = 'tracker';
  var request = 'set';
  var values = {};

  this.addValue = function (key, val) {
    values[key] = val;
  };

  this.addValues = function (obj) {
    extend(values, obj);
  };

  this.getMessage = function () {
    return {
      category: category,
      request: request,
      values: values
    };
  };
};
