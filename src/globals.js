define(function (require, exports, module) {
  'use strict';

  function adjustToOSType(osType) {
    switch (osType) {
    case 'Darwin':
      break;
    case 'Linux':
      break;
    case 'Windows_NT':
      exports.speedFactor = exports.speedFactor / 3;
      exports.allowAnyKeyLocationOnRelease = true;
      break;
    }
  }

  function setToolIconToState(stateClass, isClassEnabled) {
    if (exports.eyenavIconHolder) {
      exports.eyenavIconHolder.removeClass();
      if (isClassEnabled) {
        exports.eyenavIconHolder.addClass(stateClass);
      }
    }
  }

  exports.adjustToOSType = adjustToOSType;
  exports.setToolIconToState = setToolIconToState;

  exports.eyenavIconHolder = undefined;
  exports.allowAnyKeyLocationOnRelease = false;

  exports.distanceFromScreenMm = 700;
  exports.port = 8887;
  exports.ipAddress = "127.0.0.1";
  exports.screenInches = 21.5;
  exports.speedFactor = 60000;
  exports.epsylonPercentage = 10;
  exports.manualOffset = {
    x: 0,
    y: 0
  };
});