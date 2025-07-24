export const readDir = async (path) => {
  return await window.electronAPI.invoke('read-dir', path);
};

export const getFileInfo = async (path) => {
  return await window.electronAPI.invoke('get-file-info', path);
};

export const createDir = async (path) => {
  return await window.electronAPI.invoke('create-dir', path);
};

export const deleteFiles = async (paths) => {
  return await window.electronAPI.invoke('delete-files', paths);
};

export const uploadFiles = async (files, targetPath) => {
  return await window.electronAPI.uploadFiles(files, targetPath);
};