define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    KeyEvent = brackets.getModule('utils/KeyEvent'),
    keyManager = require('./keyManager'),
    movements = require('./movements');

  var keys = keyManager.keys;

  var keyEventHandler = function (bracketsEvent, editor, event) {
    var key = keyManager.getKeyFromCodeAndLocation(event.keyCode, event.location);
    //console.log('Key code: ' + event.keyCode + ', key location: ' + event.location);
    if (key) {
      if (event.type === 'keydown') {
        keyManager.setKeyPressed(key);
      } else if (event.type === 'keyup') {
        keyManager.setKeyReleased(key);
      }

      //Future: Maybe prevent default for the commandToggle button itself (may not be necessary)
      if (keyManager.isValidKeyCommand(key)) {
        event.preventDefault();
      }
    }
  };

  //This is the main loop of the program.
  var eyeTrackerHandler = function (info, gazeData) {
    //Future: Refactor this so it complies with the other keys format. Think of a better way to manage the keys (having something like required each key adds an additional function if pressed or smth)
    var selectionKeyOn = keys.textSelection.isPressed;

    for (var key in keys) {
      if (keyManager.isValidKeyCommand(keys[key])) {
        movements.executeMovement(keys[key].func, [gazeData, selectionKeyOn]);

        if (keys[key].releaseAfterFunc) {
          keyManager.setKeyReleased(keys[key]);
        }
      }
    }
  };

  var activeEditorChangeHandler = function ($event, focusedEditor, lostEditor) {

    if (lostEditor) {
      lostEditor.off('keyup', keyEventHandler);
      lostEditor.off('keydown', keyEventHandler);
    }
    if (focusedEditor) {
      focusedEditor.on('keyup', keyEventHandler);
      focusedEditor.on('keydown', keyEventHandler);
    }
  };

  var toggleTool = function (toggle, domain) {
    var curEditor = EditorManager.getCurrentFullEditor();
    console.log(domain);
    if (toggle) {
      EditorManager.on('activeEditorChange', activeEditorChangeHandler);
      if (curEditor) {
        activeEditorChangeHandler(null, curEditor, null);
      }
      domain.on('gazeChanged', eyeTrackerHandler);
      var $result = domain.exec('start');
      
      $result.done(function (value) {
        console.log("the command succeeded!");
      });

      $result.fail(function (err) {
        console.log("the command failed; act accordingly!");
        console.log(err);
      });

    } else {
      EditorManager.off('activeEditorChange', activeEditorChangeHandler);
      if (curEditor) {
        activeEditorChangeHandler(null, null, curEditor);
      }
      domain.off('gazeChanged', eyeTrackerHandler);
      domain.exec('stop');
    }
  };
  
  module.exports.toggleTool = toggleTool;
});