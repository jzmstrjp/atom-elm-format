'use strict';
'use babel';

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

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
    this.subscriptions.add(atom.workspace.observeTextEditors(function (e) {
      return _this.handleEvents(e);
    }));
  },
  handleEvents: function handleEvents(editor) {
    var _this2 = this;

    editor.getBuffer().onWillSave(function () {
      if (atom.config.get('elm-format.formatOnSave') && _this2.isElmEditor(editor)) {
        _this2.format(editor);
      }
    });
  },
  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },
  error: function error(str) {
    if (atom.config.get('elm-format.showErrorNotifications')) {
      atom.notifications.addError(str);
    }
  },
  success: function success(str) {
    if (atom.config.get('elm-format.showNotifications')) {
      atom.notifications.addSuccess(str);
    }
  },
  formatCurrentFile: function formatCurrentFile() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    if (this.isElmEditor(editor)) {
      this.format(editor);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!'
      });
    }
  },
  isElmEditor: function isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath() && _path2.default.extname(editor.getPath()) === '.elm';
  },
  format: function format(editor) {
    try {
      var _childProcess$spawnSy = _child_process2.default.spawnSync(atom.config.get('elm-format.binary'), ['--stdin'], { input: editor.getText() });

      var status = _childProcess$spawnSy.status;
      var stdout = _childProcess$spawnSy.stdout;

      if (status === 0) {
        var cursorPosition = editor.getCursorScreenPosition();
        editor.buffer.setTextViaDiff(stdout.toString());
        editor.setCursorScreenPosition(cursorPosition);

        this.success('Formatted file');
      } else {
        this.error('elm-format exited with code ' + status);
      }
    } catch (exception) {
      this.error('elm-format exception: ' + exception);
    }
  }
};