<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between bg-white shadow-sm px-4 py-3 border-b border-gray-200">
      <button @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
        <i class="fas fa-arrow-left mr-2"></i>
        返回
      </button>

      <div class="flex-1 mx-4 truncate text-center font-medium text-gray-700">
        <i :class="fileIcon" class="mr-2" :style="`color: ${iconColor}`"></i>
        <span class="truncate">{{ filePath }}</span>
      </div>

      <button v-if="isEditable" @click="openInEditor"
        class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
        <i class="fas fa-edit mr-2"></i>
        用编辑器打开
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center bg-white">
      <i class="fas fa-spinner fa-spin text-blue-500 text-4xl mb-4"></i>
      <p class="text-gray-600">正在加载文件内容...</p>
    </div>

    <!-- 内容区域 -->
    <div v-else class="flex-1 overflow-auto bg-white">
      <!-- 图片 -->
      <div v-if="fileType === 'image'" class="flex items-center justify-center h-full p-4">
        <img :src="fileSrc" class="max-w-full max-h-full object-contain shadow-lg rounded-lg" alt="图片内容" />
      </div>

      <!-- 视频 -->
      <div v-if="fileType === 'video'" class="flex flex-col items-center justify-center h-full p-4">
        <video :src="fileSrc" controls class="max-w-full max-h-full shadow-lg rounded-lg"></video>
      </div>

      <!-- 音频 -->
      <div v-if="fileType === 'audio'" class="flex flex-col items-center justify-center h-full p-4">
        <audio :src="fileSrc" controls class="w-full max-w-md"></audio>
      </div>

      <!-- HTML -->
      <iframe v-if="fileType === 'html'" :src="filePath" class="w-full h-full border-0"></iframe>

      <!-- 文本和Markdown -->
      <div v-if="fileType === 'text' || fileType === 'markdown'" class="p-6 text-left">
        <!-- Markdown 内容 -->
        <div v-if="fileType === 'markdown'" v-html="renderedMarkdown" class="markdown-body max-w-4xl mx-auto text-left">
        </div>

        <!-- 纯文本内容 -->
        <pre v-else
          class="font-mono text-sm text-gray-800 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words text-left">{{ textContent }}</pre>
      </div>

      <!-- PDF -->
      <div v-if="fileType === 'pdf'" class="h-full">
        <vue-pdf-embed :source="pdfSource" class="h-full" />
      </div>

      <!-- 不支持的文件类型 -->
      <div v-if="fileType === 'unsupported'" class="flex flex-col items-center justify-center h-full p-8 text-center">
        <i class="fas fa-file-exclamation text-5xl text-gray-400 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-700 mb-2">不支持预览此文件类型</h2>
        <p class="text-gray-500 mb-6">文件: {{ fileName }}</p>
        <button @click="openInDefaultApp"
          class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          <i class="fas fa-external-link-alt mr-2"></i>
          尝试用系统默认应用打开
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import VuePdfEmbed from 'vue-pdf-embed';

const route = useRoute();
const router = useRouter();

const filePath = ref(route.query.path || '');
const fileType = ref('unsupported');
const fileSrc = ref('');
const textContent = ref('');
const renderedMarkdown = ref('');
const isLoading = ref(true);
const pdfSource = ref(null);

const fileExtension = computed(() => filePath.value.split('.').pop().toLowerCase());
const fileName = computed(() => filePath.value.split('/').pop().split('\\').pop());

const isEditable = computed(() => {
  return ['markdown', 'text'].includes(fileType.value);
});

const fileIcon = computed(() => {
  const icons = {
    image: 'fa-file-image',
    video: 'fa-file-video',
    audio: 'fa-file-audio',
    pdf: 'fa-file-pdf',
    html: 'fa-file-code',
    markdown: 'fa-file-alt',
    text: 'fa-file-alt',
    unsupported: 'fa-file'
  };
  return `fas ${icons[fileType.value] || icons.unsupported}`;
});

const iconColor = computed(() => {
  const colors = {
    image: '#3B82F6',
    video: '#EF4444',
    audio: '#10B981',
    pdf: '#F59E0B',
    html: '#8B5CF6',
    markdown: '#6366F1',
    text: '#64748B',
    unsupported: '#9CA3AF'
  };
  return colors[fileType.value] || colors.unsupported;
});

const determineFileType = () => {
  const ext = fileExtension.value;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['html', 'htm'].includes(ext)) return 'html';
  if (['md', 'markdown'].includes(ext)) return 'markdown';
  if (['txt', 'json', 'xml', 'css', 'js', 'vue', 'py', 'log', 'sh', 'yaml', 'yml'].includes(ext)) return 'text';
  return 'unsupported';
};

const loadFile = async () => {
  if (!filePath.value) return;
  isLoading.value = true;

  const type = determineFileType();
  fileType.value = type;

  try {
    if (['image', 'video', 'audio'].includes(type)) {
      const buffer = await window.electronAPI.readFileAsBuffer(filePath.value);
      const blob = new Blob([buffer]);
      fileSrc.value = URL.createObjectURL(blob);
    } else if (type === 'markdown' || type === 'text') {
      const res = await window.electronAPI.readTextFile(filePath.value);
      if (res.success) {
        textContent.value = res.content;
        if (type === 'markdown') {
          renderedMarkdown.value = DOMPurify.sanitize(marked.parse(res.content));
        }
      }
    } else if (type === 'pdf') {
      const buffer = await window.electronAPI.readFileAsBuffer(filePath.value);
      if (buffer) {
        pdfSource.value = { data: buffer };
      } else {
        showNotification('无法读取此PDF文件', 'error');
      }
    }
  } catch (error) {
    showNotification(`加载文件失败: ${error.message}`, 'error');
    fileType.value = 'unsupported';
  }

  isLoading.value = false;
};

onMounted(loadFile);

const goBack = () => router.go(-1);

const openInEditor = () => {
  const editorName = fileType.value === 'markdown' ? 'markdown-editor' : 'editor';
  router.push({ name: editorName, query: { path: filePath.value } });
};

const openInDefaultApp = () => {
  window.electronAPI.openPathInShell(filePath.value);
};

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' :
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
.markdown-body {
  line-height: 1.6;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: #111827;
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-body p {
  margin-bottom: 1em;
}

.markdown-body a {
  color: #3b82f6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body code {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 85%;
}

.markdown-body pre {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-body blockquote {
  border-left: 4px solid #e5e7eb;
  color: #6b7280;
  padding: 0 1em;
  margin-left: 0;
  margin-right: 0;
}

.markdown-body ul,
.markdown-body ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-body li {
  margin-bottom: 0.5em;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 0.5em;
  margin: 1em 0;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #e5e7eb;
  padding: 0.5em 1em;
}

.markdown-body th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}

/* PDF 查看器样式 */
.pdf-embed {
  width: 100%;
  height: 100%;
  border: none;
}
</style>