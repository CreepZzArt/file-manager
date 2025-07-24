import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { readDir, getFileInfo } from '../utils/electronApi';

export const useFileStore = defineStore('file', () => {
  const currentPath = ref('');
  const files = ref([]);
  const selectedFiles = ref([]);
  const searchQuery = ref('');
  const viewMode = ref('grid'); // 'grid' | 'list'

  const filteredFiles = computed(() => {
    return files.value.filter(file => 
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const loadFiles = async (path) => {
    currentPath.value = path;
    files.value = await readDir(path);
    selectedFiles.value = [];
  };

  const refresh = async () => {
    await loadFiles(currentPath.value);
  };

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

  return {
    currentPath,
    files,
    selectedFiles,
    searchQuery,
    viewMode,
    filteredFiles,
    loadFiles,
    refresh,
    selectFile
  };
});