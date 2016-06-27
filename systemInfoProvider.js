(function() {
  'use strict';

  var os = require('os'),
    DOMAIN_NAME = 'systemInfoDomain',
      _domainManager;

  function getOSType() {
    return os.type();
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
      'getOSType', // command name
      getOSType, // command handler function
      false, // this command is synchronous in Node
      'Returns the OS type of the current system', [], []);
  }

  exports.init = init;
}());