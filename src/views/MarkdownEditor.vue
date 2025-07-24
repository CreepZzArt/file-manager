<template>
  <div class="flex flex-col h-screen bg-gray-50" style="text-align: left;">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between bg-white shadow-sm px-4 py-3 border-b border-gray-200">
      <button
        @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        返回
      </button>
      
      <div class="flex-1 mx-4 truncate text-center font-medium text-gray-700">
        <i class="fas fa-file-alt mr-2 text-blue-500"></i>
        <span class="truncate">{{ filePath }}</span>
      </div>
      
      <button
        @click="saveFile"
        :disabled="isSaving"
        class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
        <span class="ml-2">{{ isSaving ? '保存中...' : '保存' }}</span>
      </button>
    </div>
    
    <!-- 主编辑区 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 编辑面板 -->
      <textarea
        v-model="rawMarkdown"
        @input="updatePreview"
        class="flex-1 p-6 font-mono text-sm text-gray-800 bg-gray-50 border-r border-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
        placeholder="输入 Markdown 内容..."
        spellcheck="false"
      ></textarea>
      
      <!-- 预览面板 -->
      <div
        class="flex-1 p-6 overflow-y-auto bg-white markdown-preview"
        v-html="renderedHtml"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const route = useRoute();
const router = useRouter();

const filePath = ref(route.query.path || '未指定文件');
const rawMarkdown = ref('');
const renderedHtml = ref('');
const isSaving = ref(false);

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true,
  highlight: function(code, lang) {
    const hljs = window.hljs;
    if (hljs && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// 1. 组件加载时读取文件内容
onMounted(async () => {
  if (route.query.path) {
    const res = await window.electronAPI.readTextFile(filePath.value);
    if (res.success) {
      rawMarkdown.value = res.content;
      updatePreview();
    } else {
      showNotification(`无法读取文件: ${res.error}`, 'error');
      rawMarkdown.value = `# 错误：无法加载文件\n\n路径: ${filePath.value}`;
      updatePreview();
    }
  }
});

// 2. 更新预览区域
const updatePreview = () => {
  const dirtyHtml = marked.parse(rawMarkdown.value);
  renderedHtml.value = DOMPurify.sanitize(dirtyHtml);
};

// 3. 保存文件
const saveFile = async () => {
  isSaving.value = true;
  const res = await window.electronAPI.saveTextFile(filePath.value, rawMarkdown.value);
  if (res.success) {
    showNotification('文件已保存！', 'success');
  } else {
    showNotification(`保存失败: ${res.error}`, 'error');
  }
  isSaving.value = false;
};

// 4. 返回上一页
const goBack = () => {
  router.go(-1);
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
</script>

<style>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Markdown 预览样式 */
.markdown-preview {
  line-height: 1.6;
  color: #374151;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: #111827;
}

.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-preview p {
  margin-bottom: 1em;
}

.markdown-preview a {
  color: #3b82f6;
  text-decoration: none;
}

.markdown-preview a:hover {
  text-decoration: underline;
}

/* 优化代码块样式 */
.markdown-preview code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
  color: #e83e8c;
  display: inline-block;
  text-align: left;
  line-height: 1.45;
}

.markdown-preview pre {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
  line-height: 1.45;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.markdown-preview pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
  display: inline;
}

.markdown-preview blockquote {
  border-left: 4px solid #e5e7eb;
  color: #6b7280;
  padding: 0 1em;
  margin-left: 0;
  margin-right: 0;
}

.markdown-preview ul,
.markdown-preview ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-preview li {
  margin-bottom: 0.5em;
}

.markdown-preview img {
  max-width: 100%;
  border-radius: 0.5em;
  margin: 1em 0;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid #e5e7eb;
  padding: 0.5em 1em;
}

.markdown-preview th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}
</style>