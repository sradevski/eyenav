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

  function getCursorCoords() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cursorPos = curEditor.getCursorPos(),
      charSize = getCharSize();

    return {
      x: Math.round(cursorPos.ch * charSize.width),
      y: Math.round(cursorPos.line * charSize.height)
    };
  }

  function getNumOfLines() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      charSize = getCharSize(),
      scrollerHeight = curEditor._codeMirror.display.scroller.children[0].clientHeight - 30;

    return Math.round(scrollerHeight / charSize.height);
  }

  function getNumOfVisibleLines() {
    var editorCoordInfo = getCurrentEditorSizeAndCoords(),
      charSize = getCharSize();

    return Math.round(editorCoordInfo.height / charSize.height);
  }

  function getScrolledLines() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      scrollPos = curEditor.getScrollPos(),
      charSize = getCharSize();

    return Math.round(scrollPos.y / charSize.height);
  }

  function getTokenAtWrapper(curEditor, cursorPos) {
    return TokenUtils.getTokenAt(curEditor._codeMirror, cursorPos, false);
  }

  exports.isFullScreen = isFullScreen;
  exports.getCurrentEditorSizeAndCoords = getCurrentEditorSizeAndCoords;
  exports.getCursorCoords = getCursorCoords;
  exports.getCharSize = getCharSize;
  exports.getNumOfLines = getNumOfLines;
  exports.getNumOfVisibleLines = getNumOfVisibleLines;
  exports.getScrolledLines = getScrolledLines;
  exports.getTokenAtWrapper = getTokenAtWrapper;
  exports.getDisplaySize = getDisplaySize;
});