define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    FileTreeView = brackets.getModule('project/FileTreeView'),
    WorkingSetView = brackets.getModule('project/WorkingSetView'),
    MainViewManager = brackets.getModule('view/MainViewManager'),
    ProjectManager = brackets.getModule('project/ProjectManager');

  var logEditorVariables = function () {
    console.log(window.screen);
    console.log(EditorManager.getCurrentFullEditor());
    console.log(FileTreeView);
    console.log(WorkingSetView);
    console.log(ProjectManager);
    console.log(MainViewManager._getPane(MainViewManager.ACTIVE_PANE));

    console.log('Height: ' + window.innerHeight);
    console.log('Width: ' + window.innerWidth);
    console.log('outerHeight: ' + window.outerHeight);
    console.log('outerWidth: ' + window.outerWidth);
    console.log('Screen left: ' + window.screenLeft);
    console.log('Screen top: ' + window.screenTop);
    console.log('ScreenX(x position of left top corner): ' + window.screenX);
    console.log('ScreenY(y position of left top corner): ' + window.screenY);

    console.log('Gutter width: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.gutters.clientWidth);
    console.log('Gutter height: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.gutters.clientHeight);
    console.log('Last wrap width: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.lastWrapWidth);
    console.log('Last wrap height: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.lastWrapHeight);
    console.log('Native Bar Width: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.nativeBarWidth);
    console.log('Scroller width: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.scroller.clientWidth);
    console.log('Scroller height: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.scroller.clientHeight);
    console.log('View Offset: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.viewOffset);
    //Same as Editor._lastEditorWidth;
    console.log('Line Width: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.lineDiv.clientWidth);
    console.log('Line Height: ' + EditorManager.getCurrentFullEditor()._codeMirror.display.lineDiv.clientHeight);
  };

  exports.logEditorVariables = logEditorVariables;
});