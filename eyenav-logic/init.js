define(function (require, exports, module) {
  'use strict';
  module.exports = function (eyeNavDomain) {
    var Menus = brackets.getModule('command/Menus'),
    CommandManager = brackets.getModule('command/CommandManager'),
    EditorManager = brackets.getModule('editor/EditorManager'),
    PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
    prefs = PreferencesManager.getExtensionPrefs('eyeNav'),
    eventManager = require('./eventManager');

    var MY_COMMAND_ID = 'stevche.radevski.eyeNav';
    prefs.definePreference('enabled', 'boolean', true);
    
    var menuToggle = function () {
      var command = CommandManager.get(MY_COMMAND_ID);
      if (command.getChecked()) {
        eventManager.toggleTool(false, eyeNavDomain);
        prefs.set('enabled', false);
        command.setChecked(false);
      } else {
        eventManager.toggleTool(true, eyeNavDomain);
        prefs.set('enabled', true);
        command.setChecked(true);
      }
    };

    var command = CommandManager.register('Enable EyeNav', MY_COMMAND_ID, menuToggle);
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    
    menu.addMenuDivider();
    menu.addMenuItem(MY_COMMAND_ID);
    command.setChecked(prefs.get('enabled'));
    eventManager.toggleTool(prefs.get('enabled'), eyeNavDomain);
  };
});