// stores/useFileStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { readDir, getFileInfo } from '../utils/electronApi';


// Electron 环境访问 fs 模块
const fs = window.require ? window.require('fs') : null
const path = window.require ? window.require('path') : null

export const useFileStore = defineStore('file', () => {
  const currentPath = ref('');
  const files = ref([]);
  const selectedFiles = ref([]);  // ✅ 多选支持
  const selectedFile = ref(null); // ✅ 单选支持（如果你需要）
  const previewFile = ref(null);
  const viewMode = ref('grid'); // 'grid' | 'list'
  const searchQuery = ref('');

  // ✅ 支持搜索过滤的文件列表
  const filteredFiles = computed(() => {
    return files.value.filter(file =>
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  // ✅ 加载目录
  const loadFiles = async (path) => {
    try {
      const fileList = await readDir(path);
      files.value = fileList;
      currentPath.value = path;
      selectedFiles.value = [];
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // ✅ 上传文件
  const uploadFiles = async (fileList) => {
    const filesToUpload = fileList.map(file => ({
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type
    }));

    const result = await window.electronAPI.saveFiles({
      files: filesToUpload,
      targetPath: currentPath.value
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    await loadFiles(currentPath.value);
    return result;
  };

  // ✅ 导航跳转目录
  const navigateTo = (path) => {
    loadFiles(path);
  };

  // ✅ 设置预览文件
  const setPreviewFile = (file) => {
    previewFile.value = file;
  };

  // ✅ 文件多选
  const selectFile = (file, multiSelect = false) => {
    if (!multiSelect) {
      selectedFiles.value = [file];
    } else {
      const index = selectedFiles.value.findIndex(f => f.path === file.path);
      if (index >= 0) {
        selectedFiles.value.splice(index, 1);
      } else {
        selectedFiles.value.push(file);
      }
    }
  };

  // ✅ 手动刷新
  const refresh = async () => {
    await loadFiles(currentPath.value);
  };

  // 删除单个文件
// fileStore.js
  function deleteFile(file) {
    if (!file || !file.path) {
      console.warn('尝试删除无效文件或路径')
      throw new Error('无效的文件或路径')
    }
    return window.electronAPI.deleteFile(file.path)
  }
  
  function setFiles(newFiles) {
    files.value = newFiles;
  }

  function setSelectedFile(file) {
    selectedFile.value = file;
  }

  return {
    currentPath,
    files,
    selectedFiles,
    selectedFile,
    previewFile,
    viewMode,
    searchQuery,
    filteredFiles,
    loadFiles,
    uploadFiles,
    navigateTo,
    setPreviewFile,
    setSelectedFile: (file) => { selectedFile.value = file },
    selectFile,
    refresh,
    setFiles, 
    setSelectedFile,
    deleteFile
  };
});
