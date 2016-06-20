define(function (require, exports, module) {
  'use strict';
  module.exports = function (socketClient, systemInfoProvider) {
    var Menus = brackets.getModule('command/Menus'),
      CommandManager = brackets.getModule('command/CommandManager'),
      EditorManager = brackets.getModule('editor/EditorManager'),
      PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
      ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),

      keyManager = require('./keyManager'),
      eventManager = require('./eventManager'),
      globals = require('./globals'),
      prefs = PreferencesManager.getExtensionPrefs('eyeNav'),
      commandId = 'stevche.radevski.eyeNav';

    var command = CommandManager.register('Enable EyeNav', commandId, menuToggle),
      $todoIcon = $('<a href="#" title="EyeNav" class="eyenav-svg"></a>').click(function () {
        menuToggle();
      }).appendTo('#main-toolbar .buttons');

    ExtensionUtils.loadStyleSheet(module, './eyeNav.css');
    prefs.definePreference('keys', 'object', {});
    prefs.definePreference('enabled', 'boolean', false);
    prefs.definePreference('port', 'number', globals.port);
    prefs.definePreference('ipAddress', 'string', globals.ipAddress);

    command.setChecked(prefs.get('enabled'));
    globals.port = prefs.get('port');
    globals.ipAddress = prefs.get('ipAddress');

    function toggleEventHandlers (toggle) {
      var curEditor = EditorManager.getCurrentFullEditor();
      if (toggle) {
        EditorManager.on('activeEditorChange', eventManager.activeEditorChangeHandler);
        socketClient.on('gazeChanged', eventManager.eyeTrackerHandler);
        socketClient.exec('start', globals.port, globals.ipAddress);
        //This handles the case when brackets starts with an opened file (so no activeEditorChange event happens)
        eventManager.activeEditorChangeHandler(null, curEditor, null);
      } else {
        EditorManager.off('activeEditorChange', eventManager.activeEditorChangeHandler);
        socketClient.off('gazeChanged', eventManager.eyeTrackerHandler);
        socketClient.exec('stop');
        eventManager.activeEditorChangeHandler(null, null, curEditor);
      }
    }

    function menuToggle() {
      var command = CommandManager.get(commandId);
      var toggleCommandChanged = !command.getChecked();

      prefs.set('enabled', toggleCommandChanged);
      command.setChecked(toggleCommandChanged);
      $todoIcon.toggleClass('active', toggleCommandChanged);

      keyManager.setUserDefinedKeys(prefs.get('keys'));
      systemInfoProvider.exec('getOSType').done(function (osType) {
        globals.adjustToOSType(osType);
      });

      toggleEventHandlers(toggleCommandChanged);
    }

    toggleEventHandlers(prefs.get('enabled'));
  };
});