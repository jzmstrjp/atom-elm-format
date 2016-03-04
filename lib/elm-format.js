'use strict';
'use babel';

var _child_process = require('child_process');

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  config: {
    binary: {
      title: 'Binary path',
      description: 'Path for elm-format',
      type: 'string',
      default: '/usr/local/bin/elm-format',
      order: 1
    },
    formatOnSave: {
      title: 'Format on save',
      description: 'Do we format when you save files?',
      type: 'boolean',
      default: false,
      order: 2
    }
  },
  subscriptions: null,

  activate: function () {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-format:file': function () {
        return _this.formatCurrentFile();
      }
    }));
    this.editorObserver = atom.workspace.observeTextEditors(function (e) {
      return _this.handleEvents(e);
    });
  },
  handleEvents: function (editor) {
    var _this2 = this;

    return editor.getBuffer().onDidSave(function (file) {
      if (atom.config.get('elm-format.formatOnSave')) {
        if (file && _path2.default.extname(file.path) === '.elm') {
          _this2.format(file);
        }
      }
    });
  },
  deactivate: function () {
    this.subscriptions.dispose();
  },
  formatCurrentFile: function () {
    const editor = atom.workspace.getActivePaneItem();

    if (!editor || editor.isModified()) {
      // Abort for invalid or unsaved text editors
      atom.notifications.addError('Please save before formatting');
      return;
    }

    const file = editor !== null ? editor.buffer.file : void 0;

    if (file && _path2.default.extname(file.path) === '.elm') {
      this.format(file);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!'
      });
    }
  },
  format: function (file) {
    const spawned = (0, _child_process.spawn)(atom.config.get('elm-format.binary'), [file.path, '--yes']);

    spawned.stderr.on('data', function (data) {
      atom.notifications.addError('elm-format', {
        detail: data
      });
    });

    spawned.on('close', function (code) {
      if (code === 0) {
        atom.notifications.addSuccess('Formatted file');
      }
    });
  }
};