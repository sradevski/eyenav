(function () {
  'use strict';

  var gazeManager = require('./eyetribe-sdk/GazeManager');
  var eye = new gazeManager();
  var _domainManager = null;
  var DOMAIN_NAME = 'eyeNav';

  var start = function () {
    eye.activate({
      host: 'localhost',
      port: 6555,
      mode: 'push',
      version: 1
    });
  };

  var stop = function () {
    eye.deactivate(function () {});
  };

  eye.on('gazeUpdate', function (gazeData, err) {
    _domainManager.emitEvent(DOMAIN_NAME, 'gazeChanged', gazeData);
  });

  //Future: Use the connected and disconnected to manage connections properly.
  eye.on('connected', function () {
    // connected to tracker server
    _domainManager.emitEvent(DOMAIN_NAME, 'trackerConnected');
  });

  eye.on('disconnected', function (err) {
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