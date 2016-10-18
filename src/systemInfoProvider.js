'use strict';

var os = require('os');

function getOSType() {
  return os.type();
}

exports.getOSType = getOSType;
