'use strict';
'use babel';

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  config: _settings2.default,
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-format:file': function elmFormatFile() {
        return _this.formatCurrentFile();
      }
    }));
    this.editorObserver = atom.workspace.observeTextEditors(function (e) {
      return _this.handleEvents(e);
    });
  },
  handleEvents: function handleEvents(editor) {
    var _this2 = this;

    return editor.getBuffer().onDidSave(function (file) {
      if (atom.config.get('elm-format.formatOnSave')) {
        if (file && _path2.default.extname(file.path) === '.elm') {
          _this2.format(file);
        }
      }
    });
  },
  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },
  formatCurrentFile: function formatCurrentFile() {
    var editor = atom.workspace.getActivePaneItem();

    if (!editor || editor.isModified()) {
      // Abort for invalid or unsaved text editors
      atom.notifications.addError('Please save before formatting');
      return;
    }

    var file = editor !== null ? editor.buffer.file : void 0;

    if (file && _path2.default.extname(file.path) === '.elm') {
      this.format(file);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!'
      });
    }
  },
  format: function format(file) {
    new _atom.BufferedProcess({
      command: atom.config.get('elm-format.binary'),
      args: [file.path, '--yes'],
      exit: function exit(code) {
        if (code === 0 && atom.config.get('elm-format.showNotifications')) {
          atom.notifications.addSuccess('Formatted file');
        } else if (atom.config.get('elm-format.showErrorNotifications')) {
          atom.notifications.addError('elm-format exited with code ' + code);
        }
      }
    });
  }
};