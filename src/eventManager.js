define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    KeyEvent = brackets.getModule('utils/KeyEvent'),
    statusBar = brackets.getModule('widgets/StatusBar'),
    globals = require('./globals'),
    keyManager = require('./keyManager'),
    movements = require('./movements');

  var keys = keyManager.keys;

  //This is the main loop of the program. Making a separate loop will result in a fixed refresh rate, but even the varying rate works quite well.
  function gazeChangedHandler(info, gazeData) {
    //Future: Refactor this so it is easily extensible with the other modifier functions. Think of a better way to manage the keys (having something like required each key adds an additional function if pressed or smth). One approach is using "before:" "after:" events for each movement.

    if (gazeData.state === 1) {
      for (var key in keys) {
        if (keyManager.isValidKeyCommand(keys[key])) {
          movements.executeMovement(keys[key].func, [gazeData, keys.textSelection.isPressed, keys.gazeManualOffset.isPressed]);
          if (keys[key].releaseAfterFunc) {
            keyManager.setKeyReleased(keys[key]);
          }
        }
      }

      globals.setToolIconToState('tracker-data', true);
    } else {
      globals.setToolIconToState('connected-to-server', true);
    }
  }

  function activeEditorChangeHandler($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      lostEditor.off('keyup', keyEventHandler)
        .off('keydown', keyEventHandler);
    }
    if (focusedEditor) {
      focusedEditor.on('keyup', keyEventHandler)
        .on('keydown', keyEventHandler);
    }
  }

  function trackerConnectedHandler() {
    globals.setToolIconToState('connected-to-server', true);
    console.log('EyeNav connected to the eye tracker server.');
  }

  function trackerDisconnectedHandler() {
    globals.setToolIconToState('active', true);
    console.log('the eye tracker server dropped and EyeNav was disconnected.');
  }

  function keyEventHandler(bracketsEvent, editor, event) {
    var key;
    //This is used to handle a strange behavior on windows where a key's location is correct on keydown, but always 0 on keyup.
    if (globals.allowAnyKeyLocationOnRelease) {
      key = keyManager.getKeyFromCode(event.keyCode);
    } else {
      key = keyManager.getKeyFromCodeAndLocation(event.keyCode, event.location);
    }

    if (key) {
      if (event.type === 'keydown' && key.location.indexOf(event.location) !== -1) {
        keyManager.setKeyPressed(key);
      } else if (event.type === 'keyup') {
        keyManager.setKeyReleased(key);
      }

      if (keys.commandToggle.isPressed || key === keys.commandToggle) {
        event.preventDefault();
      }
    }
  }

  module.exports.activeEditorChangeHandler = activeEditorChangeHandler;
  module.exports.gazeChangedHandler = gazeChangedHandler;
  module.exports.trackerConnectedHandler = trackerConnectedHandler;
  module.exports.trackerDisconnectedHandler = trackerDisconnectedHandler;
});