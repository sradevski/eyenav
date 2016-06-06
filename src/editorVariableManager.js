//NOTE: This module uses the internal _codeMirror object, so it is fragile from future updates.
define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    TokenUtils = brackets.getModule('utils/TokenUtils');

  var isFullScreen = function () {
    if (window.innerHeight === window.screen.height && window.innerWidth === window.screen.width) {
      return true;
    }
    return false;
  };
  
  var getDisplaySize = function(){
    return {
      height: window.screen.height,
      width: window.screen.width
    };
  };

  var getCurrentEditorSizeAndCoords = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cmDisplayObject = curEditor._codeMirror.display;

    var editorHeight = cmDisplayObject.lastWrapHeight;
    var editorWidth = cmDisplayObject.lineDiv.clientWidth;
    var gutterWidth = cmDisplayObject.gutters.clientWidth;
    var verticalScrollBarWidth = cmDisplayObject.barWidth;
    var rightSideMenuWidth = 30;
    var fileTreeBarWidth = window.innerWidth - gutterWidth - editorWidth - verticalScrollBarWidth - rightSideMenuWidth;

    var topAppBarHeight = isFullScreen() ? 0 : 11;
    
    //Not used, left for reference.
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

    return {
      x: cursorPos.ch * charSize.width,
      y: cursorPos.line * charSize.height
    };
  };

  var getNumOfLines = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var charSize = getCharSize();
    //Future: Figure out where the 30 pixels come from (which variable)
    var scrollerHeight = curEditor._codeMirror.display.scroller.children[0].clientHeight - 30;
    
    return Math.round(scrollerHeight / charSize.height);
  };

  var getNumOfVisibleLines = function () {
    var editorCoordInfo = getCurrentEditorSizeAndCoords();
    var charSize = getCharSize();

    return Math.round(editorCoordInfo.height / charSize.height);
  };

  var getScrolledLines = function () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var scrollPos = curEditor.getScrollPos();
    var charSize = getCharSize();
    
    return Math.round(scrollPos.y / charSize.height);
  };

  var getTokenAtWrapper = function(curEditor, cursorPos){
    return TokenUtils.getTokenAt(curEditor._codeMirror, cursorPos, false);
  };

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