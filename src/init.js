define(function (require, exports, module) {
  'use strict';
  module.exports = function (eyeNavDomain) {
    var Menus = brackets.getModule('command/Menus'),
      CommandManager = brackets.getModule('command/CommandManager'),
      EditorManager = brackets.getModule('editor/EditorManager'),
      PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
      eventManager = require('./eventManager'),
      prefs = PreferencesManager.getExtensionPrefs('eyeNav');

    var MY_COMMAND_ID = 'stevche.radevski.eyeNav';

    var menuToggle = function () {
      var command = CommandManager.get(MY_COMMAND_ID);
      var toggleCommandChanged = !command.getChecked();

      prefs.set('enabled', toggleCommandChanged);
      command.setChecked(toggleCommandChanged);
      eventManager.toggleEyeNav(toggleCommandChanged, eyeNavDomain, prefs.get('keys'));
    };

    var command = CommandManager.register('Enable EyeNav', MY_COMMAND_ID, menuToggle);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(MY_COMMAND_ID);

    prefs.definePreference('keys', 'object', {});
    prefs.definePreference('enabled', 'boolean', true);
    command.setChecked(prefs.get('enabled'));
    eventManager.toggleEyeNav(prefs.get('enabled'), eyeNavDomain);
  };
});