<template>
  <div class="file-grid" :class="viewMode">
    <div 
      v-for="file in filteredFiles" 
      :key="file.path"
      class="file-item"
      :class="{ selected: fileStore.selectedFiles.some(f => f.path === file.path) }"
      @click="selectFile(file, $event)"
      @dblclick="handleFileAction(file)"
      @contextmenu="showContextMenu($event, file)"
    >
      <div class="file-icon">
        <i :class="getFileIcon(file)"></i>
      </div>
      <div class="file-name">{{ file.name }}</div>
      <div class="file-meta">
        <span>{{ formatSize(file.size) }}</span>
        <span>{{ formatDate(file.modified) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router'; // 1. 引入 useRouter
import { useFileStore } from '../../stores/fileStore';
import { useProjectStore } from '../../stores/projectStore'; // 引入

const props = defineProps({
  viewMode: {
    type: String,
    default: 'grid'
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const router = useRouter(); // 2. 初始化 router
const projectStore = useProjectStore(); // 使用
const fileStore = useFileStore();

const filteredFiles = computed(() => {
  console.log(fileStore.files,'fileStore.files');
  
  return fileStore.files.filter(file => 
    file.name.toLowerCase().includes(props.searchQuery.toLowerCase())
  );
});

const getFileIcon = (file) => {
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
  const documentTypes = ['doc', 'docx', 'txt', 'rtf'];
  const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
  const pdfTypes = ['pdf'];
  const videoTypes = ['mp4', 'avi', 'mkv', 'mov'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'flac'];
  const codeTypes = ['js', 'vue', 'html', 'css', 'py', 'java', 'ts', 'json'];

  if (file.isDirectory) return 'fas fa-folder';

  const ext = file.name.split('.').pop().toLowerCase();

  if (imageTypes.includes(ext)) return 'fas fa-file-image';
  if (pdfTypes.includes(ext)) return 'fas fa-file-pdf';
  if (documentTypes.includes(ext)) return 'fas fa-file-word';
  if (spreadsheetTypes.includes(ext)) return 'fas fa-file-excel';
  if (videoTypes.includes(ext)) return 'fas fa-file-video';
  if (audioTypes.includes(ext)) return 'fas fa-file-audio';
  if (codeTypes.includes(ext)) return 'fas fa-file-code';

  return 'fas fa-file';
};


const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const selectFile = (file, event) => {
  const multiSelect = event?.ctrlKey || false
  fileStore.selectFile(file, multiSelect)
};

const handleFileAction = (file) => {
  if (file.isDirectory) {
    // 目录逻辑保持不变
    const matchedProject = projectStore.projects.find(p => p.name === file.name);

    if (matchedProject) {
      projectStore.setCurrentProject(matchedProject); // 设置当前项目
      fileStore.navigateTo(file.path); // 进入该目录
    } else {
      console.warn(`目录 ${file.name} 不在有效项目列表中，禁止进入`);
      // 你可以在这里添加提示，例如使用 ElMessage 警告用户
    }
  } else {
    // --- 这是新增的文件处理逻辑 ---
    // 检查文件扩展名是否为 .txt
    if (file.name.toLowerCase().endsWith('.txt')) {
      // 使用 router.push 导航到编辑器页面
      // 并通过 query 参数传递文件的完整路径
      router.push({ 
        name: 'editor', 
        query: { path: file.path } 
      });
    } else if (file.name.toLowerCase().endsWith('.md')) {
      // 如果是 .md 文件，跳转到 Markdown 编辑器
      router.push({ name: 'markdown-editor', query: { path: file.path } });
    } else {
      // 对于其他类型的文件，暂时给一个提示
      router.push({ name: 'viewer', query: { path: file.path } });
      // alert(`暂不支持打开 '${file.name}' 类型的文件。`);
    }
  }
};


const emit = defineEmits(['contextmenu']) // 添加这行

const showContextMenu = (e, file) => {
  e.preventDefault()
  selectFile(file, false)

  emit('contextmenu', {
    file,
    event: e
  })

  const menuWidth = 160  // 右键菜单宽度，按你实际写的改
  const menuHeight = 120 // 菜单高度，按内容估算

  let left = e.clientX
  let top = e.clientY

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  if (left + menuWidth > windowWidth) {
    left = windowWidth - menuWidth - 4 // 加点边距
  }

  if (top + menuHeight > windowHeight) {
    top = windowHeight - menuHeight - 4
  }

  contextMenuX.value = left
  contextMenuY.value = top
  contextMenuVisible.value = true
};

</script>

<style scoped>
.file-grid {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.file-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.file-grid.list {
  grid-template-columns: 1fr;
}

.file-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.file-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #3b82f6;
}

.file-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
}

.file-item.selected {
  border: 2px solid #cddffd;
  background-color: #edf8ff;
}

</style>