define(function (require, exports, module) {
  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    movementDataManager = require('./movementDataManager');

  var verticalScrollCharacterPos,
    selectionStartPosition;

  function makeCursorMovement(line, character, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      currentCursor = curEditor.getCursorPos();

    if (isSelection && !selectionStartPosition) {
      selectionStartPosition = currentCursor;
    } else if (!isSelection && selectionStartPosition) {
      selectionStartPosition = undefined;
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

  function cursorClick(gazeData, isSelection) {
    var adjustedGaze = movementDataManager.adjustGazeToLongEnoughRow(gazeData),
      cursorGoal = movementDataManager.calculateCursorGoal(adjustedGaze);

    makeCursorMovement(cursorGoal.line, cursorGoal.ch, isSelection);
  }

  function verticalScroll(gazeData) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      curScrollPos = curEditor.getScrollPos(),
      velocity = movementDataManager.calculateYScrollVelocity(gazeData);

    curEditor.setScrollPos(curScrollPos.x, curScrollPos.y + velocity);
  }

  function verticalCursorScroll(gazeData, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cursorGoal = movementDataManager.calculateCursorGoal(gazeData);

    makeCursorMovement(cursorGoal.line, verticalScrollCharacterPos, isSelection);
  }

  function horizontalCursorScroll(gazeData, isSelection) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cursorPos = curEditor.getCursorPos(),
      cursorGoal = movementDataManager.calculateCursorGoal(gazeData, true);

    makeCursorMovement(cursorGoal.line, cursorGoal.ch, isSelection);
  }

  function arrowKeysMovements(direction) {
    var passedDirection = direction;

    return function (gazeData, isSelection, isGazeOffset) {
      var curEditor = EditorManager.getCurrentFullEditor(),
        cursorPos = curEditor.getCursorPos(),
        goalCursorPos = {
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

  function selectHoveredWord() {
    var curEditor = EditorManager.getCurrentFullEditor(),
      currentCursor = curEditor.getCursorPos(),
      token = movementDataManager.getTokenAtPos(currentCursor);

    curEditor.setSelection({
      line: currentCursor.line,
      ch: token.start
    }, {
      line: currentCursor.line,
      ch: token.end
    });
  }

  //Future: Do a more flexible implementation of this (including the checking of verticalCursorScroll)
  function executeMovement(actionToExecute, funcArguments) {
    var curEditor = EditorManager.getCurrentFullEditor(),
      cursorPos = curEditor.getCursorPos();

    if (actionToExecute === verticalCursorScroll) {
      if (!verticalScrollCharacterPos)
        verticalScrollCharacterPos = cursorPos.ch;
    } else {
      verticalScrollCharacterPos = undefined;
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