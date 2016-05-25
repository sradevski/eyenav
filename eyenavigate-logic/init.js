define(function (require, exports, module) {
  'use strict';
  module.exports = function (eyeNavigateDomain) {
    var Menus = brackets.getModule('command/Menus'),
    CommandManager = brackets.getModule('command/CommandManager'),
    EditorManager = brackets.getModule('editor/EditorManager'),
    PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
    prefs = PreferencesManager.getExtensionPrefs('eyeNavigate'),
    eventManager = require('./eventManager'),
    keyManager = require('./keyManager');

    //ToDo: Put menu in a proper bar menu, put menu.addMenuDivider()
    var MY_COMMAND_ID = 'stevche.radevski.eyeNavigate';
    prefs.definePreference('enabled', 'boolean', true);
    
    var menuToggle = function () {
      var command = CommandManager.get(MY_COMMAND_ID);
      if (command.getChecked()) {
        eventManager.toggleTool(false, eyeNavigateDomain);
        prefs.set('enabled', false);
        command.setChecked(false);
      } else {
        eventManager.toggleTool(true, eyeNavigateDomain);
        prefs.set('enabled', true);
        command.setChecked(true);
      }
    };

    var command = CommandManager.register('Eye Navigate', MY_COMMAND_ID, menuToggle);
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    
    menu.addMenuItem(MY_COMMAND_ID);
    command.setChecked(prefs.get('enabled'));
    eventManager.toggleTool(prefs.get('enabled'), eyeNavigateDomain);
  };
});