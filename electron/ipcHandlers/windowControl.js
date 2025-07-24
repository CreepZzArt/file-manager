// src/main/ipcHandlers/windowControl.js
import { BrowserWindow, ipcMain } from 'electron';

export function registerWindowControls() {
  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    switch (action) {
      case 'minimize':
        win.minimize();
        break;
      case 'maximize':
        win.isMaximized() ? win.unmaximize() : win.maximize();
        break;
      case 'close':
        win.close();
        break;
    }
  });

  console.log('Window controls registered');
}