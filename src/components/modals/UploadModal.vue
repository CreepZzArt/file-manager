<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
      <!-- 模态框头部 -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">上传文件</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 模态框内容 -->
      <div class="p-4 flex-1 overflow-y-auto">
        <!-- 拖放区域 -->
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': dragOver }"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="handleDrop"
        >
          <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
          <p class="text-gray-500 mb-2">拖放文件到此处或</p>
          <input 
            type="file" 
            id="fileInput"
            ref="fileInput"
            multiple
            @change="handleFileSelect"
            class="hidden"
          >
          <button 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            @click.stop="$refs.fileInput.click()"
          >
            选择文件
          </button>
        </div>
        
        <!-- 文件列表 -->
        <div class="mt-4 space-y-2" v-if="files.length > 0">
          <div v-for="file in files" :key="file.name" class="flex items-center p-2 border-b border-gray-100">
            <i class="fas fa-file text-gray-500 mr-3"></i>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
              <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
            </div>
            <button 
              @click="removeFile(file)"
              class="text-gray-400 hover:text-red-500 ml-2"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 模态框底部 -->
      <div class="flex justify-end p-4 border-t border-gray-200 space-x-2">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          取消
        </button>
        <button 
          @click="uploadFiles"
          :disabled="uploading || files.length === 0"
          class="px-4 py-2 bg-blue-500 text-white rounded-md transition-colors"
          :class="{
            'hover:bg-blue-600': !uploading && files.length > 0,
            'opacity-50 cursor-not-allowed': uploading || files.length === 0
          }"
        >
          <span v-if="uploading">
            <i class="fas fa-spinner fa-spin mr-1"></i> 上传中...
          </span>
          <span v-else>开始上传</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFileStore } from '../../stores/fileStore';

const emit = defineEmits(['close', 'upload-success']);
const props = defineProps({
  projectName: {
    type: String,
    required: true
  }
})

const fileStore = useFileStore();

const fileInput = ref(null);
const files = ref([]);
const dragOver = ref(false);
const uploading = ref(false);


const handleFileSelect = (e) => {
  files.value = Array.from(e.target.files);
  e.target.value = ''; // 重置input，允许重复选择相同文件
};

const handleDrop = (e) => {
  e.preventDefault();
  dragOver.value = false;
  files.value = Array.from(e.dataTransfer.files);
};

const removeFile = (file) => {
  files.value = files.value.filter(f => f !== file);
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadFiles = async () => {
  const uploadData = files.value.map(file => {
    if (!file.path) console.warn('文件缺少path属性:', file)
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.path || '',
      lastModified: file.lastModified
    }
  })
  
  const targetDir = props.projectName || 'data'
  console.log(targetDir,'targetDir');
  
  uploading.value = true
  try {
    console.log('Starting upload with data:', uploadData)

   const result = await window.electronAPI.uploadFiles({
      files: uploadData,
      targetDir: props.projectName
    })

    console.log('Upload result:', result)

    if (!result.success) {
      throw new Error(result.error || '上传失败')
    }

    const failedUploads = result.results?.filter(r => r.status !== 'success') || []
    if (failedUploads.length > 0) {
      console.error('部分文件上传失败:', failedUploads)
      alert(`${failedUploads.length} 个文件上传失败`)
    }

    const filepath = result.results[0]?.path
    if (filepath) {
      const directory = getDirname(filepath)
      await fileStore.loadFiles(directory)
    }

    emit('upload-success')
  } catch (error) {
    console.error('上传出错:', error)
    alert(`上传失败: ${error.message}`)
  } finally {
    uploading.value = false
  }
}


function getDirname(filepath) {
  const sep = '\\'; // Windows 路径分隔符
  const parts = filepath.split(sep);
  parts.pop(); // 去掉最后一个文件名
  return parts.join(sep);
}
</script>