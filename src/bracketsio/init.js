define(function(require, exports, module) {
	'use strict';
	module.exports = function(socketClient, systemInfoProvider) {
		var CommandManager = brackets.getModule('command/CommandManager'),
			EditorManager = brackets.getModule('editor/EditorManager'),
			PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
			ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),

			keyManager = require('../keyManager'),
			eventManager = require('../eventManager'),
			globals = require('../globals'),
			editorActionManager = require('./editorActionManager'),

			prefs = PreferencesManager.getExtensionPrefs('eyeNav'),
			commandId = 'stevche.radevski.eyeNav',
			command = CommandManager.register('Enable EyeNav', commandId, menuToggle),
			eyenavIcon = $('<a href="#" title="EyeNav" id="eyenav-icon"></a>').click(function() {
				menuToggle();
			}).appendTo('#main-toolbar .buttons');

		ExtensionUtils.loadStyleSheet(module, './eyeNav.css');

		prefs.definePreference('keys', 'object', {});
		prefs.definePreference('enabled', 'boolean', false);
		prefs.definePreference('port', 'number', globals.port);
		prefs.definePreference('ipAddress', 'string', globals.ipAddress);

		command.setChecked(prefs.get('enabled'));
		keyManager.setUserDefinedKeys(prefs.get('keys'));
		systemInfoProvider.exec('getOSType').done(function(osType) {
			globals.adjustToOSType(osType);
		});

		globals.eyenavIconHolder = eyenavIcon;
		globals.port = prefs.get('port');
		globals.ipAddress = prefs.get('ipAddress');

		setToolIconToEnabled(prefs.get('enabled'));
		toggleEventHandlers(prefs.get('enabled'));

		function toggleEventHandlers(toggle) {
			var curEditor = EditorManager.getCurrentFullEditor();
			if (toggle) {
				EditorManager.on('activeEditorChange', activeEditorChangeHandler);
				socketClient.on('gazeChanged', eventManager.gazeChangedHandler);
				socketClient.on('trackerConnected', eventManager.trackerConnectedHandler);
				socketClient.on('trackerDisconnected', eventManager.trackerDisconnectedHandler);
				socketClient.exec('start', globals.port, globals.ipAddress);
				//This handles the case when brackets starts with an opened file (so no activeEditorChange event happens)
				activeEditorChangeHandler(undefined, curEditor, undefined);
			} else {
				EditorManager.off('activeEditorChange', activeEditorChangeHandler);
				socketClient.off('gazeChanged', eventManager.gazeChangedHandler);
				socketClient.off('trackerConnected', eventManager.trackerConnectedHandler);
				socketClient.off('trackerDisconnected', eventManager.trackerDisconnectedHandler);
				socketClient.exec('stop');
				activeEditorChangeHandler(undefined, undefined, curEditor);
			}
		}

		function activeEditorChangeHandler(eventInfo, focusedEditor, lostEditor) {
			if (lostEditor) {
				lostEditor.off('keyup', eventManager.keyEventHandler)
					.off('keydown', eventManager.keyEventHandler);
			}
			if (focusedEditor) {
				focusedEditor.on('keyup', eventManager.keyEventHandler)
					.on('keydown', eventManager.keyEventHandler);
			}
		}

		function setToolIconToEnabled(isEnabled) {
			if (isEnabled) {
				editorActionManager.setToolIconToEnabled();
			} else {
				editorActionManager.setToolIconToDisabled();
			}
		}

		function menuToggle() {
			var command = CommandManager.get(commandId),
				toggleCommandChanged = !command.getChecked();

			prefs.set('enabled', toggleCommandChanged);
			command.setChecked(toggleCommandChanged);
			setToolIconToEnabled(toggleCommandChanged);
			toggleEventHandlers(toggleCommandChanged);
		}
	};
});
