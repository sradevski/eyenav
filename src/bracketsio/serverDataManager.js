(function () {
  'use strict';

  var eventEmitter = require('events').EventEmitter,
    socketClient = require('../socketClient'),
    _domainManager,
    DOMAIN_NAME = 'socketDomain';


  function start (port, ipAddress) {
    var emitter = new eventEmitter();
    emitter.on('trackerConnected', function(){
      _domainManager.emitEvent(DOMAIN_NAME, 'trackerConnected')
    });

    emitter.on('trackerDisconnected', function(){
      _domainManager.emitEvent(DOMAIN_NAME, 'trackerDisconnected')
    });

    emitter.on('gazeChanged', function(serverDataObject){
      _domainManager.emitEvent(DOMAIN_NAME, 'gazeChanged', serverDataObject)
    });

    socketClient.start(port, ipAddress, emitter);
  }

  function stop () {
    socketClient.stop();
  }

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
      'Starts the eyeNav Tool', [{
          name: "port",
          type: "number",
          description: "The port of the websocket server"
      },
        {
          name: "ipAddress",
          type: "string",
          description: "The ip address of the websocket server"
        }], []);

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

    domainManager.registerEvent(DOMAIN_NAME, 'trackerDisconnected', []);

    domainManager.registerEvent(DOMAIN_NAME, 'gazeChanged', [{
      name: 'gazeData',
      type: 'object'
    }]);
  }

  exports.init = init;
}());
