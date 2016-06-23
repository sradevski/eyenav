define(function (require, exports, module) {
  'use strict';

  //Helper function that merges two or more objects into one.
  function collect() {
    var ret = {};
    var len = arguments.length;
    for (var i = 0; i < len; i++) {
      for (var p in arguments[i]) {
        if (arguments[i].hasOwnProperty(p)) {
          ret[p] = arguments[i][p];
        }
      }
    }
    return ret;
  }

  var triggerKeys = {
    commandToggle: {
      keyCode: 18,
      location: [2],
      btnName: 'rightAlt',
      isPressed: false,
      releaseAfterFunc: false,
      func: function () {}
    }
  };

  var modifierKeys = {
    textSelection: {
      keyCode: 16,
      location: [1],
      btnName: 'leftShift',
      isPressed: false,
      releaseAfterFunc: false,
      func: function () {}
    },
    gazeManualOffset: {
      keyCode: 190,
      location: [0],
      btnName: 'fullStop',
      isPressed: false,
      releaseAfterFunc: false,
      func: function () {}
    },
  };

  var commandKeys = {
    freeMove: {
      keyCode: 76,
      location: [0],
      btnName: 'L',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').cursorClick
    },
    click: {
      keyCode: 81,
      location: [0],
      btnName: 'Q',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').cursorClick
    },
    verticalScroll: {
      keyCode: 90,
      location: [0],
      btnName: 'Z',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').verticalScroll
    },
    verticalCursorScroll: {
      keyCode: 70,
      location: [0],
      btnName: 'F',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').verticalCursorScroll
    },
    horizontalCursorScroll: {
      keyCode: 82,
      location: [0],
      btnName: 'R',
      isPressed: false,
      releaseAfterFunc: false,
      func: require('./movements').horizontalCursorScroll
    },
    selectHoveredWord: {
      keyCode: 80,
      location: [0],
      btnName: 'P',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').selectHoveredWord
    },
    cursorUp: {
      keyCode: 87,
      location: [0],
      btnName: 'W',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('up')
    },
    cursorDown: {
      keyCode: 83,
      location: [0],
      btnName: 'S',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('down')
    },
    cursorLeft: {
      keyCode: 65,
      location: [0],
      btnName: 'A',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('left')
    },
    cursorRight: {
      keyCode: 68,
      location: [0],
      btnName: 'D',
      isPressed: false,
      releaseAfterFunc: true,
      func: require('./movements').arrowKeysMovements('right')
    }
  };

  var keys = collect(triggerKeys, modifierKeys, commandKeys);

  var isKeyPressed = function (key) {
    return key.isPressed;
  };

  function setKeyPressed(key) {
    if (key) {
      key.isPressed = true;
    }
  }

  function setKeyReleased(key) {
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
  }

  function getKeyFromCode(keyCode) {
    for (var k in keys) {
      if (keys[k].keyCode === keyCode)
        return keys[k];
    }

    return undefined;
  }

  function getKeyFromCodeAndLocation(keyCode, keyLocation) {
    for (var k in keys) {
      if (keys[k].keyCode === keyCode && keys[k].location.indexOf(keyLocation) !== -1)
        return keys[k];
    }

    return undefined;
  }

  function isValidKeyCommand(key) {
    if (key === keys.commandToggle || !keys.commandToggle.isPressed) {
      return false;
    }

    return isKeyPressed(key);
  }


  //Note: This works only for 2 level objects such as mine, it is not flexible at all. As Brackets doesn't allow other libraries and I cannot use lodash or similar, this solution is enough.
  function setUserDefinedKeys(userKeys) {
    if (userKeys && Object.keys(userKeys).length) {

      Object.keys(userKeys).forEach(function (key) {
        Object.keys(userKeys[key]).forEach(function (inKey) {
          if (inKey in keys[key]) {
            keys[key][inKey] = userKeys[key][inKey];
          }
        });
      });

    }
  }

  exports.getKeyFromCodeAndLocation = getKeyFromCodeAndLocation;
  exports.getKeyFromCode = getKeyFromCode;
  exports.isValidKeyCommand = isValidKeyCommand;
  exports.isKeyPressed = isKeyPressed;
  exports.setKeyPressed = setKeyPressed;
  exports.setKeyReleased = setKeyReleased;
  exports.setUserDefinedKeys = setUserDefinedKeys;
  exports.keys = keys;
});