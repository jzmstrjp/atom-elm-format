'use babel';

import { CompositeDisposable, BufferedProcess } from 'atom';
import path from 'path';

module.exports = {
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
    showNotifications: {
      title: 'Show notifications on save',
      description: 'Do you want to see the bar when we save?',
      type: 'boolean',
      default: true,
      order: 3,
    },
  },
  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-format:file': () => this.formatCurrentFile(),
    }));
    this.editorObserver = atom.workspace.observeTextEditors(e => this.handleEvents(e));
  },

  handleEvents(editor) {
    return editor.getBuffer().onDidSave(file => {
      if (atom.config.get('elm-format.formatOnSave')) {
        if (file && path.extname(file.path) === '.elm') {
          this.format(file);
        }
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  formatCurrentFile() {
    const editor = atom.workspace.getActivePaneItem();

    if (!editor || editor.isModified()) {
      // Abort for invalid or unsaved text editors
      atom.notifications.addError('Please save before formatting');
      return;
    }

    const file = editor !== null ? editor.buffer.file : void 0;

    if (file && path.extname(file.path) === '.elm') {
      this.format(file);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!',
      });
    }
  },

  format(file) {
    new BufferedProcess({
      command: atom.config.get('elm-format.binary'),
      args: [file.path, '--yes'],
      exit: code => {
        if (code === 0 && atom.config.get('elm-format.showNotifications')) {
          atom.notifications.addSuccess('Formatted file');
        }
      },
    });
  },
};
