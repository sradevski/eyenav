define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    editorVariableManager = require('./editorVariableManager'),
    movementDataManager = require('./movementDataManager');

  var verticalScrollCharacterPos = null;
  var selectionStartPosition = null;

  function makeCursorMovement (line, character, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var currentCursor = curEditor.getCursorPos();

    if (isSelection && selectionStartPosition === null) {
      selectionStartPosition = currentCursor;
    } else if (!isSelection && selectionStartPosition !== null) {
      selectionStartPosition = null;
    }

    curEditor.setCursorPos(line, character);

    if (selectionStartPosition) {
      curEditor.setSelection({
        line: selectionStartPosition.line,
        ch: selectionStartPosition.ch
      }, {
        line: line,
        ch: character
      });
    }
  }

  function cursorClick (gazeData, isSelection) {
    var cursorGoal = movementDataManager.calculateCursorOffset(gazeData, false);
    var adjustedCursor = movementDataManager.adjustCursorToValidLine(cursorGoal, gazeData);

    if (movementDataManager.isGoalLineWithinBorders(adjustedCursor.vertical)) {
      makeCursorMovement(adjustedCursor.vertical, adjustedCursor.horizontal, isSelection);
    }
  }

  function verticalScroll (gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var curScrollPos = curEditor.getScrollPos();
    var velocity = movementDataManager.calculateYScrollVelocity(gazeData);

    curEditor.setScrollPos(curScrollPos.x, curScrollPos.y + velocity);
  }

  function verticalCursorScroll (gazeData, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorPos = curEditor.getCursorPos();
    var cursorOffset = movementDataManager.calculateCursorOffset(gazeData, true);

    var goalLinePos = cursorPos.line + cursorOffset.vertical;

    if (movementDataManager.isGoalLineWithinBorders(goalLinePos)) {
      makeCursorMovement(goalLinePos, verticalScrollCharacterPos, isSelection);
    }
  }

  function horizontalCursorScroll (gazeData, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorPos = curEditor.getCursorPos();
    var cursorOffset = movementDataManager.calculateCursorOffset(gazeData, true);

    var goalCursorPos = cursorPos.ch + cursorOffset.horizontal;
    makeCursorMovement(cursorPos.line, goalCursorPos, isSelection);
  }

  function arrowKeysMovements (direction) {
    var passedDirection = direction;

    return function (gazeData, isSelection, isGazeOffset) {
      var curEditor = EditorManager.getCurrentFullEditor();
      var cursorPos = curEditor.getCursorPos();

      var goalCursorPos = {
        line: cursorPos.line,
        ch: cursorPos.ch
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

      if (isGazeOffset) {
        movementDataManager.adjustManualOffset(goalCursorPos.line - cursorPos.line, goalCursorPos.ch - cursorPos.ch);
      }
      
      makeCursorMovement(goalCursorPos.line, goalCursorPos.ch, isSelection);
    };
  }

  function selectHoveredWord () {
    var curEditor = EditorManager.getCurrentFullEditor();
    var currentCursor = curEditor.getCursorPos();
    var token = movementDataManager.getTokenAtPos(currentCursor);

    curEditor.setSelection({
      line: currentCursor.line,
      ch: token.start
    }, {
      line: currentCursor.line,
      ch: token.end
    });
  }

  //Future: Do a more flexible implementation of this (including the checking of verticalCursorScroll)
  function executeMovement (actionToExecute, funcArguments) {
    var curEditor = EditorManager.getCurrentFullEditor();
    var cursorPos = curEditor.getCursorPos();

    if (actionToExecute === verticalCursorScroll) {
      if (!verticalScrollCharacterPos)
        verticalScrollCharacterPos = cursorPos.ch;
    } else {
      verticalScrollCharacterPos = null;
    }

    actionToExecute.apply(undefined, funcArguments);
  }

  exports.cursorClick = cursorClick;
  exports.horizontalCursorScroll = horizontalCursorScroll;
  exports.verticalCursorScroll = verticalCursorScroll;
  exports.verticalScroll = verticalScroll;
  exports.executeMovement = executeMovement;
  exports.arrowKeysMovements = arrowKeysMovements;
  exports.selectHoveredWord = selectHoveredWord;
});