(function() {
  'use strict';

  var gazeManager = require('./eyetribe-sdk/GazeManager');
  var eyeTribe = new gazeManager();
  var _domainManager = null;
  var DOMAIN_NAME = 'eyeNav';

  var start = function() {
    eyeTribe.activate({
      host: 'localhost',
      port: 6555,
      mode: 'push',
      version: 1
    });
  };

  var stop = function() {
    eyeTribe.deactivate(function() {});
  };

  //Usually when both values are zero it is because the tracker failed to locate the gaze.
  var isValidGaze = function(gazeData) {
    if (gazeData.x === 0 && gazeData.y === 0) {
      return false;
    }

    return true;
  };

  eyeTribe.on('gazeUpdate', function(gazeData, err) {
    //Note: This is the gaze format used throughout eyeNav. It can be extended as needed by the requirements.
    var eyeNavGazeFormattedData = {
      x: gazeData.avg.x,
      y: gazeData.avg.y,
      raw: {
        x: gazeData.raw.x,
        y: gazeData.raw.y
      },
      timestamp: gazeData.timestamp
    };

    if (isValidGaze(eyeNavGazeFormattedData)) {
      _domainManager.emitEvent(DOMAIN_NAME, 'gazeChanged', eyeNavGazeFormattedData);
    }
  });

  //Future: Use the connected and disconnected to manage connections properly.
  eyeTribe.on('connected', function() {
    // connected to tracker server
    _domainManager.emitEvent(DOMAIN_NAME, 'trackerConnected');
  });

  eyeTribe.on('disconnected', function(err) {
    // err not null if disconnected because of an error.
    _domainManager.emitEvent(DOMAIN_NAME, 'trackerDisconnected', err);
  });

  //This is how you export a module to be consumed in a brackets plugin
  function init(domainManager) {
    _domainManager = domainManager;

    if (!domainManager.hasDomain(DOMAIN_NAME)) {
      domainManager.registerDomain(DOMAIN_NAME, {
        major: 0,
        minor: 1
      });
    }

    domainManager.registerCommand(
      DOMAIN_NAME, // domain name
      'start', // command name
      start, // command handler function
      false, // this command is synchronous in Node
      'Starts the eyeNav Tool', [], []);

    domainManager.registerCommand(DOMAIN_NAME, // domain name
      'stop', // command name
      stop, // command handler function
      false, // this command is synchronous in Node
      'Stops the eyeNav Tool', [], [{
        name: 'tester', // return values
        type: 'number',
        description: 'amount of memory in bytes'
      }]);

    domainManager.registerEvent(DOMAIN_NAME, 'trackerConnected', []);

    domainManager.registerEvent(DOMAIN_NAME, 'trackerDisconnected', [{
      name: 'err',
      type: 'object'
    }]);

    domainManager.registerEvent(DOMAIN_NAME, 'gazeChanged', [{
      name: 'gazeData',
      type: 'object'
    }]);
  }

  exports.init = init;
}());