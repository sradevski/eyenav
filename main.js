define(function (require, exports, module) {
  'use strict';

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    AppInit = brackets.getModule('utils/AppInit'),
    NodeDomain = brackets.getModule('utils/NodeDomain'),
    init = require('src/bracketsio/init');

  var socketDomainName = 'socketDomain';
  var systemInfoDomainName = 'systemInfoDomain';

  //NodeDomain imports an external module, the one that connects the eyetracker sdk and the brackets extension in this case.
  var socketClient = new NodeDomain(socketDomainName, ExtensionUtils.getModulePath(module, 'src/bracketsio/serverDataManager.js'));

  var systemInfoProvider = new NodeDomain(systemInfoDomainName, ExtensionUtils.getModulePath(module, 'src/bracketsio/systemInfoManager.js'));

  AppInit.appReady(function () {
    init(socketClient, systemInfoProvider);
  });
});
