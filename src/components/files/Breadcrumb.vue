<template>
  <div class="breadcrumb">
    <span 
      v-for="(part, index) in pathParts" 
      :key="index"
      @click="navigateTo(index)"
      :class="{ 'current': index === pathParts.length - 1 }"
    >
      {{ part }}
      <span v-if="index < pathParts.length - 1" class="separator">/</span>
    </span>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import path from 'path-browserify'; // 前端路径处理
import { useFileStore } from '../../stores/fileStore';
import { useProjectStore } from '../../stores/projectStore';


const fileStore = useFileStore();
const projectStore = useProjectStore();

const pathParts = computed(() => {
  if (!fileStore.currentPath) return [];

  const baseFolder = 'data';
  const index = fileStore.currentPath.indexOf(baseFolder);
  const relativePath = index >= 0 ? fileStore.currentPath.slice(index) : fileStore.currentPath;

  return relativePath.split(/[\\/]/).filter(part => part !== '');
});

const navigateTo = (index) => {
  const newPath = pathParts.value.slice(0, index + 1).join('/');
  fileStore.navigateTo(newPath);
};

// 👉 监听 pathParts，当路径为 'data' 时设置当前项目为默认 data 项目
watch(pathParts, (newParts) => {
  if (newParts.length === 1 && newParts[0] === 'data') {
    const defaultProject = {
      id: 0,
      name: 'data',
      status: 'active'
    };
    projectStore.setCurrentProject(defaultProject);
  }
});
</script>


<style scoped>
.breadcrumb {
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.breadcrumb span {
  cursor: pointer;
  margin: 0 2px;
}

.breadcrumb span:hover {
  color: #1890ff;
}

.breadcrumb .current {
  color: #6c757d;
  cursor: default;
}

.breadcrumb .separator {
  margin-left: 4px;
  color: #adb5bd;
  cursor: default;
}
</style>