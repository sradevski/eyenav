define(function (require, exports, module) {
  'use strict';

  //This is how you load external modules.
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    AppInit = brackets.getModule('utils/AppInit'),
    NodeDomain = brackets.getModule('utils/NodeDomain');

  var init = require('eyenavigate-logic/init');
  var DOMAIN_NAME = 'eyeNavigate';

  //Registering the module that connects the eyetribe sdk and the brackets extension.
  var eyeNavigateDomain = new NodeDomain(DOMAIN_NAME, ExtensionUtils.getModulePath(module, 'eyeTribeBridge.js'));

  AppInit.appReady(function () {
    init(eyeNavigateDomain);
  });
});