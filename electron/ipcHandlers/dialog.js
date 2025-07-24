// src/main/ipcHandlers/dialog.js
import { ipcMain, dialog } from 'electron';

export function registerDialogHandlers() {
  ipcMain.handle('show-message-box', async (_, options) => {
    return dialog.showMessageBox(options);
  });

  console.log('Dialog handlers registered');
}