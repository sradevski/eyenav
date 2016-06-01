define(function (require, exports, module) {
  'use strict';

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    AppInit = brackets.getModule('utils/AppInit'),
    NodeDomain = brackets.getModule('utils/NodeDomain'),
    init = require('eyenav-logic/init');

  var DOMAIN_NAME = 'eyeNav';

  //NodeDomain imports an external module, the one that connects the eyetracker sdk and the brackets extension in this case.
  var eyeNavDomain = new NodeDomain(DOMAIN_NAME, ExtensionUtils.getModulePath(module, 'eyeTribeBridge.js'));

  AppInit.appReady(function () {
    init(eyeNavDomain);
  });
});