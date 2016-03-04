'use babel';

import { spawn } from 'child_process';
import { CompositeDisposable } from 'atom';
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
    return editor.getBuffer().onWillSave(file => {
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
    const spawned = spawn(atom.config.get('elm-format.binary'), [file.path, '--yes']);

    spawned.stderr.on('data', data => {
      atom.notifications.addError('elm-format', {
        detail: data,
      });
    });

    spawned.on('close', code => {
      if (code === 0) {
        atom.notifications.addSuccess('Formatted file');
      }
    });
  },
};
