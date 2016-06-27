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

  function calculateCursorGoal(gazeData, currentRowOnly) {
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords()),
      scrolledHeight = editorVariableManager.getScrolledHeight(),
      xLocation = normalizedGazeData.x,
      yLocation = normalizedGazeData.y + scrolledHeight;

    if (currentRowOnly) {
      var cursorCoords = editorVariableManager.getCursorCoords();
      yLocation = (cursorCoords.top + cursorCoords.bottom) / 2;
    }

    return editorVariableManager.getCursorLocationFromCoords(xLocation, yLocation);
  }

  function adjustGazeToLongEnoughRow(gazeData) {
    var normalizedGazeData = normalizeGazeDataXY(gazeData, editorVariableManager.getCurrentEditorSizeAndCoords()),
      scrolledHeight = editorVariableManager.getScrolledHeight(),
      charSize = editorVariableManager.getCharSize(),

      //A multiple of the theoretical error done by eye trackers.
      avgCharWidthError = Math.round(getAverageGazeErrorInPixels() / charSize.width) * 2,
      avgRowHeightError = Math.round(getAverageGazeErrorInPixels() / charSize.height) * 4,

      //If the gaze is closer to the top or bottom of the row.
      direction = normalizedGazeData.y % charSize.height < (charSize.height / 2) ? -1 : 1,
      originalDirection = direction,

      goalCharPosition = normalizedGazeData.x / charSize.width,
      rowOffset = 1,
      yAdjustment = 0;

    //Until a long enough row is found, looking as far as several times the gaze error.
    while (rowOffset < avgRowHeightError) {
      var rowLength = editorVariableManager.getRowLengthAtY(normalizedGazeData.y + yAdjustment + scrolledHeight);
      if (rowLength >= (goalCharPosition - avgCharWidthError)) {
        break;
      }

      //Adjusting one row up or down in an alternating manner, getting the closest viable row.
      yAdjustment = (rowOffset * direction) * charSize.height;
      direction *= -1;
      if (direction === originalDirection) {
        rowOffset += 1;
      }
    }

    return {
      x: gazeData.x,
      y: gazeData.y + yAdjustment
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
  
  function getTokenAtPos(cursorPos) {
    var curEditor = EditorManager.getCurrentFullEditor();
    if (cursorPos) {
      return editorVariableManager.getTokenAtWrapper(curEditor, cursorPos);

    } else {
      return editorVariableManager.getTokenAtWrapper(curEditor, curEditor.getCursorPos());
    }
  }

  exports.adjustGazeToLongEnoughRow = adjustGazeToLongEnoughRow;
  exports.normalizeGazeDataXY = normalizeGazeDataXY;
  exports.calculateYScrollVelocity = calculateYScrollVelocity;
  exports.calculateCursorGoal = calculateCursorGoal;
  exports.adjustManualOffset = adjustManualOffset;
  exports.getTokenAtPos = getTokenAtPos;
});