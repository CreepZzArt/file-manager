<template>
  <div class="editor-container bg-gray-50 h-screen flex flex-col">
    <div class="editor-header bg-white shadow-sm py-3 px-4 flex items-center justify-between border-b border-gray-200">
      <button 
        @click="goBack" 
        class="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        返回
      </button>
      
      <div class="flex-1 mx-4 truncate text-center text-gray-700 font-medium">
        <i class="fas fa-file-alt mr-2 text-blue-500"></i>
        <span class="truncate">{{ filePath }}</span>
      </div>
      
      <button 
        @click="saveFile" 
        :disabled="isSaving"
        class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
        <span class="ml-2">{{ isSaving ? '保存中...' : '保存' }}</span>
      </button>
    </div>
    
    <textarea 
      v-model="content" 
      class="editor-textarea flex-grow m-4 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-800 font-mono text-sm"
      placeholder="正在加载文件..."
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const filePath = ref(route.query.path || '未指定文件');
const content = ref('');
const isSaving = ref(false);

// 组件加载时，读取文件内容
onMounted(async () => {
  if (route.query.path) {
    const res = await window.electronAPI.readTextFile(filePath.value);
    if (res.success) {
      content.value = res.content;
    } else {
      alert(`无法读取文件: ${res.error}`);
      content.value = `错误：无法加载文件 ${filePath.value}`;
    }
  }
});

// 保存文件方法
const saveFile = async () => {
  isSaving.value = true;
  const res = await window.electronAPI.saveTextFile(filePath.value, content.value);
  if (res.success) {
    // 使用更美观的通知代替原生alert
    showNotification('文件已保存！', 'success');
  } else {
    showNotification(`保存失败: ${res.error}`, 'error');
  }
  isSaving.value = false;
};

// 显示通知
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${
        type === 'success' ? 'fa-check-circle' : 
        type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
      } mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// 返回文件列表
const goBack = () => {
  router.go(-1); // 或者 router.push('/')
};
</script>

<style>
/* 自定义滚动条样式 */
.editor-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.editor-textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.editor-textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>