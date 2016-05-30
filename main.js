define(function (require, exports, module) {
  'use strict';

  //This is how you load external modules.
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    AppInit = brackets.getModule('utils/AppInit'),
    NodeDomain = brackets.getModule('utils/NodeDomain'),
    init = require('eyenav-logic/init');
  
  var DOMAIN_NAME = 'eyeNav';

  //Registering the module that connects the eyetribe sdk and the brackets extension.
  var eyeNavDomain = new NodeDomain(DOMAIN_NAME, ExtensionUtils.getModulePath(module, 'eyeTribeBridge.js'));

  AppInit.appReady(function () {
    init(eyeNavDomain);
  });
});