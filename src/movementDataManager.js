define(function (require, exports, module) {
  'use strict';
  var EditorManager = brackets.getModule('editor/EditorManager'),
      editorVariableManager = require('./editorVariableManager');

  var DISTANCE_FROM_SCREEN_MM = 700;
  var SCREEN_INCHES = 21.5;
  //ToDo: Scrolling speed on windows is different, so test it out and use different values for windows.
  var SPEED_FACTOR = 80000;
  var EPSYLON_PERCENTAGE = 10;

  var manualOffset = {
    x: 0,
    y: 0
  };
  
  //This calculates the theoretical average error for most eye trackers, which is 1 degree angle.
  var getAverageGazeErrorInPixels = function () {
    var screenSize = editorVariableManager.getDisplaySize();
    var errorInMm = DISTANCE_FROM_SCREEN_MM * Math.tan(0.5 * Math.PI / 180);
    var ppi = Math.sqrt(Math.pow(screenSize.height, 2) + Math.pow(screenSize.width, 2)) / SCREEN_INCHES;
    var dotPitch = 25.4 / ppi;

    return Math.round(errorInMm / dotPitch);
  };
  
  //It normalizes the xy coordinates having the top right corner of the editor as an origin.
  var normalizeGazeDataXY = function (gazeData, editorCoordInfo) {
    var normalizedData = {};
    normalizedData.x = (gazeData.x + manualOffset.x) - editorCoordInfo.x;
    normalizedData.y = (gazeData.y + manualOffset.y) - editorCoordInfo.y;
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

    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords());
    var charSize = editorVariableManager.getCharSize();
    var scrolledLines = editorVariableManager.getScrolledLines();

    var horizontalOffset = Math.round((normalizedGazeData.x - cursorCoords.x) / charSize.width);
    var verticalOffset = Math.round((normalizedGazeData.y - cursorCoords.y) / charSize.height);

    return {
      horizontal: horizontalOffset,
      vertical: verticalOffset + scrolledLines
    };
  };

  var adjustCursorToValidLine = function (cursorGoal, gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords());
    var charSize = editorVariableManager.getCharSize();
    var avgCharWidthError = Math.round(getAverageGazeErrorInPixels() * 2 / charSize.width);

    var modulo = normalizedGazeData.y % charSize.height;
    var direction = modulo < (charSize.height / 2) ? -1 : 1;
    var originalDirection = direction;
    var goalLine = cursorGoal.vertical;
    var lineOffset = 1;

    while (curEditor.document.getLine(goalLine).length < (cursorGoal.horizontal - avgCharWidthError)) {
      goalLine = cursorGoal.vertical + (lineOffset * direction);
      direction *= -1;
      if (direction === originalDirection) {
        lineOffset += 1;
      }
    }

    return {
      horizontal: cursorGoal.horizontal,
      vertical: goalLine
    };
  };
  
  var calculateYScrollVelocity = function (gazeData) {
    var editorCoordInfo = editorVariableManager.getCurrentEditorSizeAndCoords();
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorCoordInfo);
    var velocityY = 0;

    var midPoint = editorCoordInfo.height / 2;
    var epsylon = (editorCoordInfo.height / 100) * EPSYLON_PERCENTAGE;
    var direction = normalizedGazeData.y - midPoint > 0 ? 1 : -1;
    var speedFactor = SPEED_FACTOR / editorCoordInfo.height;
    //From 0 to 1 for half screen (height / 2 - epsylon)
    var normalizedYLocation = (Math.abs(normalizedGazeData.y - midPoint) - epsylon) / (midPoint - epsylon);

    //Check if the user is looking inside the editor window
    if (normalizedGazeData.y > 0 || normalizedGazeData.y <= editorCoordInfo.height) {
      //Check if the user is looking away from the center for some epsylon outset.
      if (Math.abs(normalizedGazeData.y - midPoint) > epsylon) {
        velocityY = Math.pow(normalizedYLocation, 2) * speedFactor * direction;
      }
    }

    return velocityY;
  };
  
  var adjustManualOffset = function(xOffset, yOffset){
    var charSize = editorVariableManager.getCharSize();
    manualOffset.x += xOffset * charSize.width;
    manualOffset.y += yOffset * charSize.height;
  };
  
  var isGoalLineWithinBorders = function (goalLine) {
    var numOfLines = editorVariableManager.getNumOfLines();
    var scrolledLines = editorVariableManager.getScrolledLines();
    var maxLinesInScreen = editorVariableManager.getNumOfVisibleLines();

    if (goalLine >= scrolledLines && goalLine < (scrolledLines + maxLinesInScreen)) {
      return true;
    }

    return false;
  };
  
  var getTokenAtPos = function (cursorPos) {
    var curEditor = EditorManager.getCurrentFullEditor();
    if (cursorPos) {
      return editorVariableManager.getTokenAtWrapper(curEditor, cursorPos);

    } else {
      return editorVariableManager.getTokenAtWrapper(curEditor, curEditor.getCursorPos());
    }
  };  
  
  exports.adjustCursorToValidLine = adjustCursorToValidLine;
  exports.normalizeGazeDataXY = normalizeGazeDataXY;
  exports.calculateYScrollVelocity = calculateYScrollVelocity;
  exports.calculateCursorOffset = calculateCursorOffset;
  exports.adjustManualOffset = adjustManualOffset;
  exports.isGoalLineWithinBorders = isGoalLineWithinBorders;
  exports.getTokenAtPos = getTokenAtPos;
});