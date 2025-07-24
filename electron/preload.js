// preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  // 测试方法
  ping: () => {
    console.log('[Preload] ping被调用')
    return ipcRenderer.invoke('ping')
  },
  openPathInShell: (fullPath) => ipcRenderer.invoke('open-path-in-shell', fullPath),
  checkPathExists: (dirPath) => ipcRenderer.invoke('check-path-exists', dirPath),
  readFileAsBuffer: (filePath) => ipcRenderer.invoke('read-file-as-buffer', filePath),
  readTextFile: (filePath) => ipcRenderer.invoke('read-text-file', filePath),
  saveTextFile: (filePath, content) => ipcRenderer.invoke('save-text-file', filePath, content),
  getRelativeDirPath: (filePath) => ipcRenderer.invoke('get-relative-dir-path', filePath),
  ensureDataDir: async () => await ipcRenderer.invoke('ensure-data-dir'),
  readProjectDir: (projectName) => ipcRenderer.invoke('read-project-dir', projectName),
  createProjectDir: (name) => ipcRenderer.invoke('create-project-dir', name),
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },
  readDir: (path) => ipcRenderer.invoke('read-dir', path),
  getFileInfo: (path) => ipcRenderer.invoke('get-file-info', path),
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  deleteFiles: (paths) => ipcRenderer.invoke('delete-files', paths),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  saveFiles: async (files, targetPath) => {
    const fileData = files.map(file => ({
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
    return ipcRenderer.invoke('save-files', { files: fileData, targetPath });
  },
  uploadFiles: async ({ files, targetDir }) => {
    if (!Array.isArray(files)) throw new Error('files参数必须是数组');

    const serializedFiles = files.map(file => ({
      name: file.name || 'unnamed',
      size: file.size || 0,
      path: file.path || '',
      type: file.type || '',
      lastModified: file.lastModified || Date.now()
    }));

    return await ipcRenderer.invoke('upload-files', { files: serializedFiles, targetDir });
  },

  onUploadProgress: (callback) => {
    ipcRenderer.on('upload-progress', callback);
    return () => ipcRenderer.removeAllListeners('upload-progress');
  }
});

// 添加错误监听
process.on('uncaughtException', (error) => {
  console.error('[Preload] 未捕获异常:', error)
})