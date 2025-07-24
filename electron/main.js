// src/main/main.js
import { app, BrowserWindow, ipcMain, dialog } from 'electron'; // 添加ipcMain导入
import path from 'path';
import { fileURLToPath } from 'url';
import { registerWindowControls } from './ipcHandlers/windowControl.js';
import { registerFileSystemHandlers } from './ipcHandlers/fileSystem.js';
import { registerDialogHandlers } from './ipcHandlers/dialog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化所有 IPC 处理器
function registerIpcHandlers() {
  registerWindowControls();
  registerFileSystemHandlers();
  registerDialogHandlers();

  // 测试用 IPC
  ipcMain.handle('ping', () => {
    console.log('[Main] 收到ping请求');
    return 'pong from main';
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  console.log(devUrl);

  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('主进程未捕获异常:', error);
  dialog.showErrorBox('主进程错误', error.stack || error.message);
});