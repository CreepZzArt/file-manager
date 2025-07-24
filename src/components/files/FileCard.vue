<template>
  <div
    class="file-card"
    :class="{ selected: isSelected }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu="handleContextMenu"
  >
    <div class="file-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="file-name">{{ file.name }}</div>
    <div class="file-meta">
      <span>{{ formattedSize }}</span>
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFileStore } from '@/stores/useFileStore';

const props = defineProps({
  file: Object,
  isSelected: Boolean
});

const emit = defineEmits(['select', 'open', 'contextmenu']);

const fileStore = useFileStore();

const iconClass = computed(() => {
  if (props.file.isDirectory) return 'fas fa-folder text-yellow-400';
  
  const ext = props.file.name.split('.').pop().toLowerCase();
  const icons = {
    pdf: 'fas fa-file-pdf text-red-500',
    doc: 'fas fa-file-word text-blue-500',
    xls: 'fas fa-file-excel text-green-500',
    // 添加更多文件类型...
  };
  
  return icons[ext] || 'fas fa-file text-gray-500';
});

const formattedSize = computed(() => {
  if (props.file.isDirectory) return '--';
  const size = props.file.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

const formattedDate = computed(() => {
  return new Date(props.file.modified).toLocaleDateString();
});

const handleClick = () => {
  emit('select', props.file);
};

const handleDoubleClick = () => {
  emit('open', props.file);
};

const handleContextMenu = (e) => {
  e.preventDefault();
  emit('contextmenu', { file: props.file, event: e });
};
</script>

<style scoped>
.file-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-card:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.file-card.selected {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.file-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  text-align: center;
}

.file-name {
  font-weight: 500;
  text-align: center;
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
</style>