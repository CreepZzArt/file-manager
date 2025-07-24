<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>分享文件</h3>
        <button @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="share-options">
          <div class="option" @click="shareVia('link')">
            <i class="fas fa-link"></i>
            <span>生成分享链接</span>
          </div>
          <div class="option" @click="shareVia('email')">
            <i class="fas fa-envelope"></i>
            <span>通过邮件发送</span>
          </div>
        </div>
        
        <div v-if="shareLink" class="link-section">
          <input 
            type="text" 
            :value="shareLink"
            readonly
            ref="linkInput"
          >
          <button @click="copyLink">
            <i class="fas fa-copy"></i> 复制
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFileStore } from '../../stores/fileStore';

const fileStore = useFileStore();
const shareLink = ref('');
const linkInput = ref(null);

const shareVia = async (method) => {
  if (method === 'link') {
    // 实际项目中这里应该调用后端API生成链接
    shareLink.value = `https://share.example.com/${fileStore.selectedFile.name}`;
  } else if (method === 'email') {
    window.open(`mailto:?subject=分享文件&body=请查看此文件: ${fileStore.selectedFile.name}`);
  }
};

const copyLink = () => {
  linkInput.value.select();
  document.execCommand('copy');
};
</script>

<style scoped>
/* 复用UploadModal的样式，添加以下额外样式 */
.share-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.option {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.option i {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
  color: #3b82f6;
}

.link-section {
  display: flex;
  gap: 8px;
}

.link-section input {
  flex: 1;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
</style>