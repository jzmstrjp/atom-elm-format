var spawn = require('child_process').spawn;
var CompositeDisposable = require('atom').CompositeDisposable;
var MyPackage;
var path = require('path');

module.exports = MyPackage = {
  config: {
    binary: {
      title: 'Binary path',
      description: 'Path for elm-format',
      type: 'string',
      default: '/usr/local/bin/elm-format',
      order: 1,
    },
    formatOnSave: {
      title: 'Format on save',
      description: 'Do we format when you save files?',
      type: 'boolean',
      default: false,
      order: 2,
    },
  },
  modalPanel: null,
  subscriptions: null,

  activate: function(state) {
    atom.config.set("binary", '/usr/local/bin/elm-format');
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-format:file': (function(_this) {
        return function() {
          return _this.formatCurrentFile();
        };
      })(this)
    }));
    this.editorObserver = atom.workspace.observeTextEditors((function(_this) {
      return function(editor) {
        return _this.handleEvents(editor);
      };
    })(this));
  },

  handleEvents: function(editor) {
    var self = this;
    return editor.getBuffer().onWillSave(function(file) {
      if (atom.config.get('elm-format.formatOnSave')) {
        var file = editor != null ? editor.buffer.file : void 0;

        if (file && path.extname(file.path) == '.elm') {
          self.format(file);
        }
      }
    });
  },

  deactivate: function() {
    this.subscriptions.dispose();
  },

  serialize: function() {
    return {};
  },

  formatCurrentFile: function() {
    var editor = atom.workspace.getActivePaneItem();

    if (!editor || editor.isModified()) {
      // Abort for invalid or unsaved text editors
      atom.notifications.addError('Please save before formatting');
      return;
    }

    var file = editor != null ? editor.buffer.file : void 0;

    if (file && path.extname(file.path) == '.elm') {
      this.format(file);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!'
      });
    }
  },

  format: function(file) {
    var spawned = spawn(atom.config.get('elm-format.binary'), [ file.path, '--yes' ]);

    spawned.stderr.on('data', function (data) {
      atom.notifications.addError('elm-format', {
        detail: data,
      });
    });

    spawned.on('close', function (code) {
      if (code === 0) {
        atom.notifications.addSuccess('Formatted file');
      }
    });
  }
};
