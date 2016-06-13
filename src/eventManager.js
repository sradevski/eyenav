define(function(require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    KeyEvent = brackets.getModule('utils/KeyEvent'),
    globals = require('./globals'),
    keyManager = require('./keyManager'),
    movements = require('./movements');

  var keys = keyManager.keys;

  //This is the main loop of the program.
  var eyeTrackerHandler = function(info, gazeData) {
    //Future: Refactor this so it is easily extensible with the other modifier functions. Think of a better way to manage the keys (having something like required each key adds an additional function if pressed or smth). One approach is using "before:" "after:" events for each movement.
    for (var key in keys) {
      if (keyManager.isValidKeyCommand(keys[key])) {
        movements.executeMovement(keys[key].func, [gazeData, keys.textSelection.isPressed]);
        if (keys[key].releaseAfterFunc) {
          keyManager.setKeyReleased(keys[key]);
        }
      }
    }
  };

  var keyEventHandler = function(bracketsEvent, editor, event) {
    var key;
    
    //This is used to handle a strange behavior on windows where a key's location is correct on keydown, but always 0 on keyup.
    if (globals.allowAnyKeyLocationOnRelease) {
      key = keyManager.getKeyFromCode(event.keyCode);
    } else {
      key = keyManager.getKeyFromCodeAndLocation(event.keyCode, event.location);
    }
    
    if (key) {
      if (event.type === 'keydown' && key.location === event.location) {
        keyManager.setKeyPressed(key);
      } else if (event.type === 'keyup') {
        keyManager.setKeyReleased(key);
      }

      if (keyManager.isValidKeyCommand(key) || keyManager.keys.commandToggle === key) {
        event.preventDefault();
      }
    }
  };

  var activeEditorChangeHandler = function($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      lostEditor.off('keyup', keyEventHandler)
        .off('keydown', keyEventHandler);
    }
    if (focusedEditor) {
      focusedEditor.on('keyup', keyEventHandler)
        .on('keydown', keyEventHandler);
    }
  };

  var toggleEyeNav = function(toggle, socketClient, systemInfoProvider, userDefinedKeys) {
    var curEditor = EditorManager.getCurrentFullEditor();
    keyManager.setUserDefinedKeys(userDefinedKeys);
    systemInfoProvider.exec('getOSType').done(function(osType){
      globals.adjustToOSType(osType);
    });

    if (toggle) {
      EditorManager.on('activeEditorChange', activeEditorChangeHandler);
      socketClient.on('gazeChanged', eyeTrackerHandler);
      socketClient.exec('start');
      //This handles the case when brackets starts with an opened file (so no activeEditorChange event happens)
      activeEditorChangeHandler(null, curEditor, null);
    } else {
      EditorManager.off('activeEditorChange', activeEditorChangeHandler);
      socketClient.off('gazeChanged', eyeTrackerHandler);
      socketClient.exec('stop');
      activeEditorChangeHandler(null, null, curEditor);
    }
  };

  module.exports.toggleEyeNav = toggleEyeNav;
});