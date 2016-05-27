define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    EventDispatcher = brackets.getModule('utils/EventDispatcher'),
    editorVariableManager = require('./editorVariableManager'),
    loggerForTest = require('./loggerForTest');

  var SPEED_FACTOR = 120;
  var EPSYLON_PERCENTAGE = 0.1;

  var verticalScrollCharacterPos = null;
  var selectionStartPosition = null;
  //Future: Save this to preferences (if I cant find a better way to adjust position)
  var manualOffset = {
    x: 0,
    y: 0
  };

  //Future: Clean up this mess, should be done in a much better way.
  var makeCursorMovement = function (line, character, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var currentCursor = curEditor.getCursorPos();

    if(isSelection && selectionStartPosition === null){
      selectionStartPosition = currentCursor;
    }
    else if (!isSelection && selectionStartPosition !== null){
      selectionStartPosition = null;
    }
    
    curEditor.setCursorPos(line, character);

    if (selectionStartPosition) {
      curEditor.setSelection({
        line: selectionStartPosition.line,
        ch: selectionStartPosition.ch
      }, {
        line: line,
        ch: character
      });
    }
  };

  //Future: Normalize the gaze data at the bridge level.
  var normalizeGazeDataXY = function (gazeData, editorCoordInfo) {
    var normalizedData = {};
    normalizedData.x = (gazeData.avg.x + manualOffset.x) - editorCoordInfo.x;
    normalizedData.y = (gazeData.avg.y + manualOffset.y) - editorCoordInfo.y;
    return normalizedData;
  };

  var calculateCursorOffset = function (gazeData, useCursor) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorCoords = {
      x: 0,
      y: 0
    };
    if (useCursor) {
      cursorCoords = editorVariableManager.getCursorCoords();
    }

    var charSize = editorVariableManager.getCharSize();
    var editorCoordInfo = editorVariableManager.getCurrentEditorSizeAndCoords();
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorCoordInfo);
    var scrolledLines = editorVariableManager.getScrolledLines();

    var horizontalOffset = ~~((normalizedGazeData.x - cursorCoords.x) / charSize.width);
    var verticalOffset = ~~((normalizedGazeData.y - cursorCoords.y) / charSize.height);

    return {
      horizontal: horizontalOffset,
      vertical: verticalOffset + scrolledLines
    };
  };

  //Future: Make velocity change exponential, not linear.
  var calculateYScrollVelocity = function (gazeData) {
    var editorCoordInfo = editorVariableManager.getCurrentEditorSizeAndCoords();
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorCoordInfo);
    var midPoint = editorCoordInfo.height / 2;
    var epsylon = editorCoordInfo.height * EPSYLON_PERCENTAGE;
    var speedFactor = SPEED_FACTOR / editorCoordInfo.height;
    var velocityY = 0;

    //Check if the user is looking close to the center
    if (Math.abs(normalizedGazeData.y - midPoint) > epsylon) {
      //Check if the user is looking inside the editor window
      if (normalizedGazeData.y > 0 || normalizedGazeData.y <= editorCoordInfo.height) {
        velocityY = (normalizedGazeData.y - midPoint - epsylon) * speedFactor;
      }
    }
    return velocityY;
  };

  var cursorClick = function (gazeData, isSelection) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {
      var offset = calculateCursorOffset(gazeData, false);

      if (editorVariableManager.isGoalLineWithinBorders(offset.vertical)) {
        makeCursorMovement(offset.vertical, offset.horizontal, isSelection);
      }
    }
  };

  var verticalScroll = function (gazeData) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {

      var curEditor = EditorManager.getCurrentFullEditor();
      var curScrollPos = curEditor.getScrollPos();
      var velocity = calculateYScrollVelocity(gazeData);

      curEditor.setScrollPos(curScrollPos.x, curScrollPos.y + velocity);
    }
  };

  var verticalCursorScroll = function (gazeData, isSelection) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {

      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();
      var cursorOffset = calculateCursorOffset(gazeData, true);

      var goalLinePos = cursorPos.line + cursorOffset.vertical;

      if (editorVariableManager.isGoalLineWithinBorders(goalLinePos)) {
        makeCursorMovement(goalLinePos, verticalScrollCharacterPos, isSelection);
      }
    }
  };

  var horizontalCursorScroll = function (gazeData, isSelection) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {

      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();
      var cursorOffset = calculateCursorOffset(gazeData, true);

      var goalCursorPos = cursorPos.ch + cursorOffset.horizontal;
      makeCursorMovement(cursorPos.line, goalCursorPos, isSelection);
    }
  };

  var arrowKeysMovements = function (direction) {
    var passedDirection = direction;

    return function (gazeData, isSelection) {
      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();

      var goalCursorPos = {
        ch: cursorPos.ch,
        line: cursorPos.line
      };

      switch (passedDirection) {
      case 'up':
        goalCursorPos.line -= 1;
        break;
      case 'down':
        goalCursorPos.line += 1;
        break;
      case 'left':
        goalCursorPos.ch -= 1;
        break;
      case 'right':
        goalCursorPos.ch += 1;
        break;
      default:
        break;
      }

      makeCursorMovement(goalCursorPos.line, goalCursorPos.ch, isSelection);
    };
  };

  var setManualOffset = function (xOffset, yOffset) {
    var xOff = xOffset;
    var yOff = yOffset;

    return function (gazeData, isSelection) {
      var charSize = editorVariableManager.getCharSize();
      var direction = "";
      manualOffset.x += xOff * charSize.width;
      manualOffset.y += yOff * charSize.height;

      if (xOff === -1) direction = "left";
      else if (xOff === 1) direction = "right";
      else if (yOff === -1) direction = "up";
      else if (yOff === 1) direction = "down";

      arrowKeysMovements(direction)(gazeData, isSelection);
    };
  };

  var selectHoveredWord = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var currentCursor = curEditor.getCursorPos();
    var token = editorVariableManager.getToken(currentCursor);

    curEditor.setSelection({
      line: currentCursor.line,
      ch: token.start
    }, {
      line: currentCursor.line,
      ch: token.end
    });
  };

  //Future: Think of a more flexible implementation of this (including the checking of verticalCursorScroll)
  var executeMovement = function (actionToExecute, funcArguments) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorPos = curEditor.getCursorPos();

    if (actionToExecute === this.verticalCursorScroll) {
      if (!verticalScrollCharacterPos)
        verticalScrollCharacterPos = cursorPos.ch;
    } else {
      verticalScrollCharacterPos = null;
    }

    actionToExecute.apply(undefined, funcArguments);
  };

  exports.cursorClick = cursorClick;
  exports.horizontalCursorScroll = horizontalCursorScroll;
  exports.verticalCursorScroll = verticalCursorScroll;
  exports.verticalScroll = verticalScroll;
  exports.executeMovement = executeMovement;
  exports.arrowKeysMovements = arrowKeysMovements;
  exports.setManualOffset = setManualOffset;
  exports.selectHoveredWord = selectHoveredWord;
});