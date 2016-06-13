define(function (require, exports, module) {
  'use strict';
  
  var adjustToOSType = function(osType){
    switch(osType){
      case 'Darwin':
        break;
      case 'Linux':
        break;
      case 'Windows_NT':
        exports.speedFactor = 40000;
        exports.allowAnyKeyLocationOnRelease = true;
        break;
    }  
  };

  exports.adjustToOSType = adjustToOSType;

  exports.allowAnyKeyLocationOnRelease = false;
  exports.distanceFromScreenMm = 700;
  exports.screenInches = 21.5;
  exports.speedFactor = 80000;
  exports.epsylonPercentage = 10;
  exports.manualOffset = {
    x: 0,
    y: 0
  };
});