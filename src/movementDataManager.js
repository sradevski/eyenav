define(function (require, exports, module) {
  'use strict';
  var EditorManager = brackets.getModule('editor/EditorManager'),
    editorVariableManager = require('./editorVariableManager'),
    globals = require('./globals');


  //This calculates the theoretical average error for most eye trackers, which is 1 degree angle.
  function getAverageGazeErrorInPixels() {
    var screenSize = editorVariableManager.getDisplaySize(),
      errorInMm = globals.distanceFromScreenMm * Math.tan(0.5 * Math.PI / 180),
      ppi = Math.sqrt(Math.pow(screenSize.height, 2) + Math.pow(screenSize.width, 2)) / globals.screenInches,
      dotPitch = 25.4 / ppi;

    return Math.round(errorInMm / dotPitch);
  }

  //It normalizes the xy coordinates having the top right corner of the editor as an origin.
  function normalizeGazeDataXY(gazeData, editorCoordInfo) {
    var normalizedData = {};
    normalizedData.x = Math.round((gazeData.x + globals.manualOffset.x) - editorCoordInfo.x);
    normalizedData.y = Math.round((gazeData.y + globals.manualOffset.y) - editorCoordInfo.y);
    return normalizedData;
  }

  function calculateCursorOffset(gazeData, useCursor) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cursorCoords = {
        x: 0,
        y: 0
      };
    if (useCursor) {
      cursorCoords = editorVariableManager.getCursorCoords();
    }

    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords()),
      charSize = editorVariableManager.getCharSize(),
      scrolledLines = editorVariableManager.getScrolledLines(),

      horizontalOffset = Math.round((normalizedGazeData.x - cursorCoords.x) / charSize.width),
      verticalOffset = Math.round((normalizedGazeData.y - cursorCoords.y) / charSize.height);

    return {
      horizontal: horizontalOffset,
      vertical: verticalOffset + scrolledLines
    };
  }
  
  function adjustCursorToValidLine(cursorGoal, gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords()),
      charSize = editorVariableManager.getCharSize(),
      avgCharWidthError = Math.round(getAverageGazeErrorInPixels() * 2 / charSize.width),

      modulo = normalizedGazeData.y % charSize.height,
      direction = modulo < (charSize.height / 2) ? -1 : 1,
      originalDirection = direction,
      goalLine = cursorGoal.vertical,
      lineOffset = 1;

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
  }

  function calculateYScrollVelocity(gazeData) {
    var editorCoordInfo = editorVariableManager.getCurrentEditorSizeAndCoords(),
      normalizedGazeData = normalizeGazeDataXY(gazeData, editorCoordInfo),
      velocityY = 0,

      midPoint = editorCoordInfo.height / 2,
      epsylon = (editorCoordInfo.height / 100) * globals.epsylonPercentage,
      direction = normalizedGazeData.y - midPoint > 0 ? 1 : -1,
      speedFactor = globals.speedFactor / editorCoordInfo.height,
      //From 0 to 1 for half screen (height / 2 - epsylon)
      normalizedYLocation = (Math.abs(normalizedGazeData.y - midPoint) - epsylon) / (midPoint - epsylon);

    //Check if the user is looking inside the editor window
    if (normalizedGazeData.y > 0 || normalizedGazeData.y <= editorCoordInfo.height) {
      //Check if the user is looking away from the center for some epsylon outset.
      if (Math.abs(normalizedGazeData.y - midPoint) > epsylon) {
        velocityY = Math.pow(normalizedYLocation, 2) * speedFactor * direction;
      }
    }

    return velocityY;
  }

  function adjustManualOffset(yOffset, xOffset) {
    var charSize = editorVariableManager.getCharSize();
    globals.manualOffset.x += xOffset * charSize.width;
    globals.manualOffset.y += yOffset * charSize.height;
  }

  function isGoalLineWithinBorders(goalLine) {
    var numOfLines = editorVariableManager.getNumOfLines(),
      scrolledLines = editorVariableManager.getScrolledLines(),
      maxLinesInScreen = editorVariableManager.getNumOfVisibleLines();

    if (goalLine >= scrolledLines && goalLine < (scrolledLines + maxLinesInScreen)) {
      return true;
    }

    return false;
  }

  function getTokenAtPos(cursorPos) {
    var curEditor = EditorManager.getCurrentFullEditor();
    if (cursorPos) {
      return editorVariableManager.getTokenAtWrapper(curEditor, cursorPos);

    } else {
      return editorVariableManager.getTokenAtWrapper(curEditor, curEditor.getCursorPos());
    }
  }

  exports.adjustCursorToValidLine = adjustCursorToValidLine;
  exports.normalizeGazeDataXY = normalizeGazeDataXY;
  exports.calculateYScrollVelocity = calculateYScrollVelocity;
  exports.calculateCursorOffset = calculateCursorOffset;
  exports.adjustManualOffset = adjustManualOffset;
  exports.isGoalLineWithinBorders = isGoalLineWithinBorders;
  exports.getTokenAtPos = getTokenAtPos;
});