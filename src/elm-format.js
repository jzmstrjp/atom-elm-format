'use babel';

import { CompositeDisposable, BufferedProcess } from 'atom';
import path from 'path';
import config from './settings';
import fs from 'fs';

module.exports = {
  config,
  subscriptions: null,
  // TODO: Some better debounce/throttle function
  lastSave: Date.now(),

  activate() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-format:file': () => this.formatCurrentFile(),
    }));
    this.editorObserver = atom.workspace.observeTextEditors(e => this.handleEvents(e));
  },

  handleEvents(editor) {
    return editor.getBuffer().onDidSave(file => {
      if (Date.now() - 1000 > this.lastSave) {
        this.lastSave = Date.now();
        if (atom.config.get('elm-format.formatOnSave') && this.isElmFile(file)) {
          this.format(file, editor);
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

    if (this.isElmFile(file)) {
      this.format(file, editor);
    } else {
      atom.notifications.addInfo('Not an Elm file', {
        dismissable: false,
        detail: 'I only know how to format .elm-files, sorry!',
      });
    }
  },

  isElmFile(file) {
    return file && path.extname(file.path) === '.elm';
  },

  format(file, editor) {
    const cursorPosition = editor.getCursorScreenPosition();
    new BufferedProcess({
      command: atom.config.get('elm-format.binary'),
      args: [file.path, '--yes', '--output', '/tmp/elm-format.tmp'],
      exit: code => {
        if (code === 0) {
          fs.readFile('/tmp/elm-format.tmp', 'utf8', (err, data) => {
            editor.setText(data);
            editor.save();
            editor.setCursorScreenPosition(cursorPosition);

            if (atom.config.get('elm-format.showNotifications')) {
              atom.notifications.addSuccess('Formatted file');
            }
          });
        } else if (atom.config.get('elm-format.showErrorNotifications')) {
          atom.notifications.addError(`elm-format exited with code ${code}`);
        }
      },
    });
  },
};
