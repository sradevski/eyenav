var Response = function (category, request, statuscode) {

  var emptyValues = true;
  var values = {};

  this.addValue = function (key, value) {
    values[key] = value;
    emptyValues = false;
  };

  this.getMessage = function () {
    var msg = {
      category: category,
      request: request,
      statuscode: statuscode
    };

    if (!emptyValues) {
      msg.values = values;
    }
    
    return msg;
  };
};

module.exports = Response;
