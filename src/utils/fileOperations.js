export const openFile = async (filePath) => {
  return await window.electronAPI.invoke('file:open', filePath)
}

export const deleteFiles = async (filePaths) => {
  return await window.electronAPI.invoke('file:delete', filePaths)
}

export const createDirectory = async (dirPath) => {
  return await window.electronAPI.invoke('file:mkdir', dirPath)
}

export const renameFile = async (oldPath, newPath) => {
  return await window.electronAPI.invoke('file:rename', { oldPath, newPath })
}

// 检查路径是否存在
export const checkPathExists = async (path) => {
  try {
    await window.electronAPI.invoke('file:checkPathExists', path);
    return true;
  } catch (error) {
    return false;
  }
}
