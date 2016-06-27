//NOTE: This module uses the internal _codeMirror object, so it is fragile from future updates. There are also several hardcoded values for margins that may change in future.
define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    TokenUtils = brackets.getModule('utils/TokenUtils');

  function isFullScreen() {
    if (window.innerHeight === window.screen.height && window.innerWidth === window.screen.width) {
      return true;
    }
    return false;
  }

  function getDisplaySize() {
    return {
      height: window.screen.height,
      width: window.screen.width
    };
  }

  function getCurrentEditorSizeAndCoords() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cmDisplayObject = curEditor._codeMirror.display;

    var editorHeight = cmDisplayObject.lastWrapHeight,
      editorWidth = cmDisplayObject.lineDiv.clientWidth,
      gutterWidth = cmDisplayObject.gutters.clientWidth,
      verticalScrollBarWidth = cmDisplayObject.barWidth,
      rightSideMenuWidth = 30,
      topAppBarHeight = isFullScreen() ? 0 : 11,
      fileTreeBarWidth = window.innerWidth - gutterWidth - editorWidth - verticalScrollBarWidth - rightSideMenuWidth;

    var coords = {};
    coords.x = window.screenX + fileTreeBarWidth + gutterWidth;
    coords.y = window.screenY + topAppBarHeight;
    coords.height = editorHeight;
    coords.width = editorWidth;

    return coords;
  }

  function getCharSize() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      charWidth = curEditor._codeMirror.display.cachedCharWidth || 12,
      rowHeight = curEditor._codeMirror.display.cachedTextHeight || 25;

    return {
      width: charWidth,
      height: rowHeight
    };
  }

  function getScrolledHeight() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      scrollPos = curEditor.getScrollPos();

    return scrollPos.y;
  }

  function getCursorLocationFromCoords(x, y, line) {
    var cmEditor = EditorManager.getCurrentFullEditor()._codeMirror;

    return cmEditor.coordsChar({
      left: x,
      top: y
    }, 'local');
  }

  function getCursorCoords(cursorObj) {
    var cmEditor = EditorManager.getCurrentFullEditor()._codeMirror;
    return cmEditor.cursorCoords(cursorObj, 'local');
  }

  
  //Note: There is a distinction between a line and a row (visible line) when line wrapping option is on. A line can have multiple rows when wrapped.
  function getRowLengthAtY(height) {
    var cmEditor = EditorManager.getCurrentFullEditor()._codeMirror,
      editorVars = getCurrentEditorSizeAndCoords(),
      charSize = getCharSize(),
      cursorLocation = getCursorLocationFromCoords(editorVars.width, height),
      lineHeight = cmEditor.getLineHandle(cursorLocation.line).height,
      rowLength = cursorLocation.ch;

    //If line is wrapped
    if (lineHeight >= charSize.height * 2) {
      rowLength = cursorLocation.ch - getCursorLocationFromCoords(editorVars.width, height - charSize.height).ch;
    }

    return rowLength;
  }

  function getTokenAtWrapper(curEditor, cursorPos) {
    return TokenUtils.getTokenAt(curEditor._codeMirror, cursorPos, false);
  }

  exports.isFullScreen = isFullScreen;
  exports.getCurrentEditorSizeAndCoords = getCurrentEditorSizeAndCoords;
  exports.getCharSize = getCharSize;
  exports.getScrolledHeight = getScrolledHeight;
  exports.getTokenAtWrapper = getTokenAtWrapper;
  exports.getDisplaySize = getDisplaySize;
  exports.getCursorLocationFromCoords = getCursorLocationFromCoords;
  exports.getCursorCoords = getCursorCoords;
  exports.getRowLengthAtY = getRowLengthAtY;
});