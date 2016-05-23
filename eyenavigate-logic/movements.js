define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    EventDispatcher = brackets.getModule('utils/EventDispatcher'),
    editorVariableManager = require('./editorVariableManager'),
    loggerForTest = require('./loggerForTest');

  var SPEED_FACTOR = 100;
  var verticalScrollCharacterPos = null;

  //Future: Normalize the gaze data at the bridge level.
  var normalizeGazeDataXY = function (gazeData, editorCoordInfo) {
    var normalizedData = {};
    normalizedData.x = gazeData.avg.x - editorCoordInfo.x;
    normalizedData.y = gazeData.avg.y - editorCoordInfo.y;

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

  var calculateYScrollVelocity = function (gazeData) {
    var editorCoordInfo = editorVariableManager.getCurrentEditorSizeAndCoords();
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorCoordInfo);
    var speedFactor = SPEED_FACTOR / editorCoordInfo.height;
    var velocityY = 0;

    if (normalizedGazeData.y <= editorCoordInfo.height) {
      velocityY = (normalizedGazeData.y - (editorCoordInfo.height / 2)) * speedFactor;
    }

    return velocityY;
  };

  var cursorClick = function (gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var offset = calculateCursorOffset(gazeData, false);

    if (editorVariableManager.isGoalLineWithinBorders(offset.vertical)) {
      curEditor.setCursorPos(offset.vertical, offset.horizontal);
    }
  };

  var verticalScroll = function (gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var curScrollPos = curEditor.getScrollPos();
    var velocity = calculateYScrollVelocity(gazeData);

    curEditor.setScrollPos(curScrollPos.x, curScrollPos.y + velocity);
  };

  var verticalCursorScroll = function (gazeData) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {

      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();
      var cursorOffset = calculateCursorOffset(gazeData, true);

      var goalLinePos = cursorPos.line + cursorOffset.vertical;

      if (editorVariableManager.isGoalLineWithinBorders(goalLinePos)) {
        curEditor.setCursorPos(goalLinePos, verticalScrollCharacterPos);
      }
    }
  };

  var horizontalCursorScroll = function (gazeData) {
    //Future: Change this to the normalized access of the data.
    if (gazeData.avg.x !== 0 && gazeData.avg.y !== 0) {

      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();
      var cursorOffset = calculateCursorOffset(gazeData, true);

      var goalCursorPos = cursorPos.ch + cursorOffset.horizontal;
      curEditor.setCursorPos(cursorPos.line, goalCursorPos);
    }
  };

  var arrowKeysMovements = function (direction) {
    var passedDirection = direction;

    return function () {
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

      curEditor.setCursorPos(goalCursorPos.line, goalCursorPos.ch);
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
  exports.selectHoveredWord = selectHoveredWord;
});