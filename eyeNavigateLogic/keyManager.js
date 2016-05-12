//Future: Maybe change everywhere from working with a key object to working with the key ID
define(function (require, exports, module) {
  'use strict';

  //Future: Manage function assignment in a way that will require for less dependencies.
  var keys = {
    commandToggle: {
      keyCode: 18,
      location: 2,
      btnName: "rightAlt",
      isPressed: false,
      func: function () {
        return 0;
      }
    },
    freeMove: {
      keyCode: 70,
      location: 0,
      btnName: "F",
      isPressed: false,
      func: require("./movements").cursorClick
    },
    click: {
      keyCode: 65,
      location: 0,
      btnName: "A",
      isPressed: false,
      //Future: This is not very clean, refactor it. Letter Buttons call the keydown event many times if you hold the button, so find a way where that doesnt happen.
      func: function (gazeData) {
        require("./movements").cursorClick(gazeData);
        require("./keyManager").setKeyReleased(keys.click);
      }
    },
    verticalScroll: {
      keyCode: 83,
      location: 0,
      btnName: "S",
      isPressed: false,
      func: require("./movements").verticalScroll
    },
    verticalCursorScroll: {
      keyCode: 87,
      location: 0,
      btnName: "W",
      isPressed: false,
      func: require("./movements").verticalCursorScroll
    },
    horizontalCursorScroll: {
      keyCode: 68,
      location: 0,
      btnName: "D",
      isPressed: false,
      func: require("./movements").horizontalCursorScroll
    }
  };

  var requiredKeys = [keys.commandToggle];
  
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
    }
  };


  var getKeyFromCodeAndLocation = function (keyCode, keyLocation) {
    for (var k in keys) {
      if (keys[k].keyCode === keyCode && keys[k].location === keyLocation)
        return keys[k];
    }

    return undefined;
  };

  var isValidKeyCommand = function(key){
    if(key === keys.commandToggle){
      return false;
    }

    for (var k in requiredKeys){
      if (!requiredKeys[k].isPressed){
        return false;
      }  
    }

    return isKeyPressed(key);
  };

  //exports.populateWriterKeyDict = populateWriterKeyDict;
  exports.getKeyFromCodeAndLocation = getKeyFromCodeAndLocation;
  exports.isValidKeyCommand = isValidKeyCommand;
  exports.isKeyPressed = isKeyPressed;
  exports.setKeyPressed = setKeyPressed;
  exports.setKeyReleased = setKeyReleased;
  exports.keys = keys;
});