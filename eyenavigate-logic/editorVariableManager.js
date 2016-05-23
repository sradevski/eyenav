//This module uses the internal _codeMirror object, so it is fragile from future updates.
define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    TokenUtils = brackets.getModule('utils/TokenUtils');

  var _self = this;

  //Future: Figure out how to detect whether it is full screen or not
  var isFullScreen = function () {
    return false;
  };

  var getCurrentEditorSizeAndCoords = function () {
    var curScreen = EditorManager.getCurrentFullEditor();
    var cmDisplayObject = curScreen._codeMirror.display;

    var editorHeight = cmDisplayObject.lastWrapHeight;
    var editorWidth = cmDisplayObject.lineDiv.clientWidth;
    var gutterWidth = cmDisplayObject.gutters.clientWidth;
    var verticalScrollBarWidth = cmDisplayObject.barWidth;
    var rightsideMenuWidth = 30;
    var fileTreeBarWidth = window.innerWidth - gutterWidth - editorWidth - verticalScrollBarWidth - rightsideMenuWidth;

    var topAppBarHeight = isFullScreen() ? 0 : 11;
    //Unnecessary, left for reference.
    //var bottomDescriptionBarHeight = 15;

    var coords = {};
    coords.x = window.screenX + fileTreeBarWidth + gutterWidth;
    coords.y = window.screenY + topAppBarHeight;
    coords.height = editorHeight;
    coords.width = editorWidth;

    return coords;
  };

  var getCharSize = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var charWidth = curEditor._codeMirror.display.cachedCharWidth || 12;
    var rowHeight = curEditor._codeMirror.display.cachedTextHeight || 25;

    return {
      width: charWidth,
      height: rowHeight
    };
  };

  var getCursorCoords = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorPos = curEditor.getCursorPos();
    var charSize = getCharSize();

    var cursorCoords = {
      x: cursorPos.ch * charSize.width,
      y: cursorPos.line * charSize.height
    };

    return cursorCoords;
  };

  var getNumOfLines = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var charSize = getCharSize();
    //Future: Figure out where the 30 pixels come from (which variable)
    var scrollerHeight = curEditor._codeMirror.display.scroller.children[0].clientHeight - 30;
    var numOfLines = ~~(scrollerHeight / charSize.height);

    return numOfLines;
  };

  var getScreenMaxNumOfLines = function () {
    var editorCoordInfo = getCurrentEditorSizeAndCoords();
    var charSize = getCharSize();

    var visibleLines = ~~(editorCoordInfo.height / charSize.height);

    return visibleLines;
  };

  var getScrolledLines = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var scrollPos = curEditor.getScrollPos();
    var charSize = getCharSize();
    var scrolledLines = ~~(scrollPos.y / charSize.height);

    return scrolledLines;
  };

  var isGoalLineWithinBorders = function (goalLine) {
    var numOfLines = getNumOfLines();
    var scrolledLines = getScrolledLines();
    var maxLinesInScreen = getScreenMaxNumOfLines();

    if (goalLine >= scrolledLines && goalLine < (scrolledLines + maxLinesInScreen)) {
      return true;
    }

    return false;
  };

  var getToken = function (cursorPos) {
    var curEditor = EditorManager.getCurrentFullEditor();

    if (cursorPos) {
      return TokenUtils.getTokenAt(curEditor._codeMirror, cursorPos, false);

    } else {
      return TokenUtils.getTokenAt(curEditor._codeMirror, curEditor.getCursorPos(), false);
    }
  };

  exports.isFullScreen = isFullScreen;
  exports.getCurrentEditorSizeAndCoords = getCurrentEditorSizeAndCoords;
  exports.getCursorCoords = getCursorCoords;
  exports.getCharSize = getCharSize;
  exports.getNumOfLines = getNumOfLines;
  exports.getScreenMaxNumOfLines = getScreenMaxNumOfLines;
  exports.getScrolledLines = getScrolledLines;
  exports.isGoalLineWithinBorders = isGoalLineWithinBorders;
  exports.getToken = getToken;
});