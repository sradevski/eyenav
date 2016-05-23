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
  var eyeTribeHanlder = function (info, gazeData) {
    for (var key in keys) {
      if (keyManager.isValidKeyCommand(keys[key])) {
        movements.executeMovement(keys[key].func, [gazeData]);
        
        if(keys[key].releaseAfterFunc){
          keyManager.setKeyReleased(keys[key]);
        }
      }
    }
  };

  var activeEditorChangeHandler = function ($event, focusedEditor, lostEditor) {
    if (lostEditor) {
      lostEditor.off('keyEvent', keyEventHandler);
    }
    if (focusedEditor) {
      focusedEditor.on('keyEvent', keyEventHandler);
    }
  };

  var toggleTool = function (toggle, command, domain) {
    if (toggle) {
      EditorManager.on('activeEditorChange', activeEditorChangeHandler);
      EditorManager.getCurrentFullEditor().on('keyEvent', keyEventHandler);
      domain.on('gazeChanged', eyeTribeHanlder);
      domain.exec('start');
      command.setChecked(true);
    } else {
      EditorManager.off('activeEditorChange', activeEditorChangeHandler);
      EditorManager.getCurrentFullEditor().off('keyEvent', keyEventHandler);
      domain.off('gazeChanged', eyeTribeHanlder);
      domain.exec('stop');
      command.setChecked(false);
    }
  };

  module.exports.toggleTool = toggleTool;
});