define(function (require, exports, module) {
  'use strict';
  module.exports = function (eyeNavigateDomain) {
    var Menus = brackets.getModule("command/Menus"),
    CommandManager = brackets.getModule("command/CommandManager"),
    EditorManager = brackets.getModule("editor/EditorManager"),
    PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
    prefs = PreferencesManager.getExtensionPrefs("eyeNavigate"),
    eventManager = require("./eventManager"),
    keyManager = require("./keyManager");

    var MY_COMMAND_ID = "stevche.radevski.eyeNavigate";
    prefs.definePreference("enabled", "boolean", true);
    
    var menuToggle = function () {
      var command = CommandManager.get(MY_COMMAND_ID);
      if (command.getChecked()) {
        eventManager.toggleTool(false, command, eyeNavigateDomain);
        prefs.set("enabled", false);
      } else {
        eventManager.toggleTool(true, command, eyeNavigateDomain);
        //prefs.set("enabled", true);
      }
    };

    var command = CommandManager.register("Eye Navigate", MY_COMMAND_ID, menuToggle);
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    
    menu.addMenuItem(MY_COMMAND_ID);
    command.setChecked(prefs.get("enabled"));
  };
});