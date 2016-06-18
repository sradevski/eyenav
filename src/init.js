define(function (require, exports, module) {
  'use strict';
  module.exports = function (socketClient, systemInfoProvider) {
    var Menus = brackets.getModule('command/Menus'),
      CommandManager = brackets.getModule('command/CommandManager'),
      EditorManager = brackets.getModule('editor/EditorManager'),
      PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
      eventManager = require('./eventManager'),
      globals = require('./globals'),
      prefs = PreferencesManager.getExtensionPrefs('eyeNav');

    var MY_COMMAND_ID = 'stevche.radevski.eyeNav';

    var menuToggle = function () {
      var command = CommandManager.get(MY_COMMAND_ID);
      var toggleCommandChanged = !command.getChecked();

      prefs.set('enabled', toggleCommandChanged);
      command.setChecked(toggleCommandChanged);
      eventManager.toggleEyeNav(toggleCommandChanged, socketClient, systemInfoProvider, prefs.get('keys'));
    };

    var command = CommandManager.register('Enable EyeNav', MY_COMMAND_ID, menuToggle);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(MY_COMMAND_ID);

    prefs.definePreference('keys', 'object', {});
    prefs.definePreference('enabled', 'boolean', false);
    prefs.definePreference('port', 'number', globals.port);
    prefs.definePreference('ipAddress', 'string', globals.ipAddress);
    
    command.setChecked(prefs.get('enabled'));
    globals.port = prefs.get('port');
    globals.ipAddress = prefs.get('ipAddress');
    eventManager.toggleEyeNav(prefs.get('enabled'), socketClient, systemInfoProvider, prefs.get('keys'));
  };
});