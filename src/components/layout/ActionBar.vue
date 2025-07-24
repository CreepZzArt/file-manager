<template>
  <div class="bg-white p-3 border-b border-gray-200 flex items-center space-x-4">
      <button @click="emit('upload')" class="flex items-center text-indigo-600 hover:text-indigo-800">
          <i class="fas fa-upload mr-2"></i> 上传文件
      </button>
      <button @click="emit('newFolder')" class="flex items-center text-indigo-600 hover:text-indigo-800">
          <i class="fas fa-folder-plus mr-2"></i> 新建文件夹
      </button>
      <button @click="emit('delete')" :disabled="!hasSelection" class="flex items-center text-indigo-600 hover:text-indigo-800">
          <i class="fas fa-trash-alt mr-2"></i> 删除
      </button>
  </div>
</template>

<script setup>
defineProps({
  hasSelection: Boolean
});

const emit = defineEmits(['upload', 'newFolder', 'delete']);
</script>

<style scoped>
.action-bar {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #e5e7eb;
}
</style>