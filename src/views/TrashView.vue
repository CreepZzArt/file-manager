<template>
  <div class="trash-view">
    <h2>回收站</h2>
    <FileGrid 
      :files="deletedFiles"
      @restore="handleRestore"
      @delete-permanent="handleDeletePermanent"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileGrid from '../components/files/FileGrid.vue';

const deletedFiles = ref([]);

const handleRestore = (file) => {
  // 恢复文件逻辑
};

const handleDeletePermanent = (file) => {
  // 永久删除逻辑
};
</script>