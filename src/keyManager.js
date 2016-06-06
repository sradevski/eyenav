define(function (require, exports, module) {
  'use strict';

  var keys = {
    commandToggle: {
      keyCode: 18,
      location: 2,
      btnName: 'rightAlt',
      isPressed: false,
      releaseAfterFunc: false,
      func: function () {}
    },
    textSelection: {
      keyCode: 16,
      location: 1,
      btnName: 'Left Shift',
      isPressed: false,
      releaseAfterFunc: false,
      func: function () {}
    },
    freeMove: {
      keyCode: 76,
      location: 0,
      btnName: 'L',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').cursorClick
    },
    click: {
      keyCode: 81,
      location: 0,
      btnName: 'Q',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').cursorClick
    },
    verticalScroll: {
      keyCode: 90,
      location: 0,
      btnName: 'Z',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').verticalScroll
    },
    verticalCursorScroll: {
      keyCode: 70,
      location: 0,
      btnName: 'F',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').verticalCursorScroll
    },
    horizontalCursorScroll: {
      keyCode: 82,
      location: 0,
      btnName: 'R',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').horizontalCursorScroll
    },
    selectHoveredWord: {
      keyCode: 80,
      location: 0,
      btnName: 'P',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').selectHoveredWord
    },
    cursorUp: {
      keyCode: 87,
      location: 0,
      btnName: 'W',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('up')
    },
    cursorDown: {
      keyCode: 83,
      location: 0,
      btnName: 'S',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('down')
    },
    cursorLeft: {
      keyCode: 65,
      location: 0,
      btnName: 'A',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('left')
    },
    cursorRight: {
      keyCode: 68,
      location: 0,
      btnName: 'D',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('right')
    },
    manualOffsetXPlus: {
      keyCode: 39,
      location: 0,
      btnName: 'Right Arrow',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').setManualOffset(1, 0)
    },
    manualOffsetXMinus: {
      keyCode: 37,
      location: 0,
      btnName: 'Left Arrow',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').setManualOffset(-1, 0)
    },
    manualOffsetYPlus: {
      keyCode: 40,
      location: 0,
      btnName: 'Down Arrow',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').setManualOffset(0, 1)
    },
    manualOffsetYMinus: {
      keyCode: 38,
      location: 0,
      btnName: 'Up Arrow',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').setManualOffset(0, -1)
    }
  };

  var isKeyPressed = function (key) {
    return key.isPressed;
  };

  var setKeyPressed = function (key) {
    if (key) {
      key.isPressed = true;
    }
  };

  var setKeyReleased = function (key) {
    if (key) {
      key.isPressed = false;

      //Reset all other keys if the command key is released
      if (key === keys.commandToggle) {
        for (var k in keys) {
          if (keys[k].hasOwnProperty("isPressed")) {
            keys[k].isPressed = false;
          }
        }
      }
    }
  };

  var getKeyFromCodeAndLocation = function (keyCode, keyLocation) {
    for (var k in keys) {
      if (keys[k].keyCode === keyCode && keys[k].location === keyLocation)
        return keys[k];
    }

    return undefined;
  };

  var isValidKeyCommand = function (key) {
    if (key === keys.commandToggle || !keys.commandToggle.isPressed) {
      return false;
    }

    return isKeyPressed(key);
  };

  exports.getKeyFromCodeAndLocation = getKeyFromCodeAndLocation;
  exports.isValidKeyCommand = isValidKeyCommand;
  exports.isKeyPressed = isKeyPressed;
  exports.setKeyPressed = setKeyPressed;
  exports.setKeyReleased = setKeyReleased;
  exports.keys = keys;
});