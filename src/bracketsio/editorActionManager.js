define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    TokenUtils = brackets.getModule('utils/TokenUtils'),
    globals = require('../globals')

  function getScrollPos(){
    return EditorManager.getCurrentFullEditor().getScrollPos();
  }

  function setScrollPos(x, y){
    EditorManager.getCurrentFullEditor().setScrollPos(x, y);
  }

  function getCursorPos(){
    return EditorManager.getCurrentFullEditor().getCursorPos();
  }

  function setCursorPos(line, character){
    EditorManager.getCurrentFullEditor().setCursorPos(line, character);
  }

  /// Both start and end object are a {line, character} objects.
  function setSelection(startLocationObj, endLocationObj){
    EditorManager.getCurrentFullEditor().setSelection(startLocationObj, endLocationObj);
  }
  function setToolIconToTracking() {
    changeToolbarIconClass('tracker-data');
  }

  function setToolIconToConnected() {
    changeToolbarIconClass('connected-to-server');
  }

  function setToolIconToEnabled(){
    changeToolbarIconClass('active');
  }

  function setToolIconToDisabled(){
    changeToolbarIconClass('');
  }

  function changeToolbarIconClass(stateClass){
    if (globals.eyenavIconHolder) {
      globals.eyenavIconHolder.removeClass();
      if(stateClass){
        globals.eyenavIconHolder.addClass(stateClass);
      }
    }
  }

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

  exports.getScrollPos = getScrollPos;
  exports.setScrollPos = setScrollPos;
  exports.getCursorPos = getCursorPos;
  exports.setCursorPos = setCursorPos;
  exports.setSelection = setSelection;
  exports.setToolIconToTracking = setToolIconToTracking;
  exports.setToolIconToConnected = setToolIconToConnected;
  exports.setToolIconToEnabled = setToolIconToEnabled;
  exports.setToolIconToDisabled = setToolIconToDisabled;

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
