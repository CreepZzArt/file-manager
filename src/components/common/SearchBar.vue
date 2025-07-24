<template>
  <div class="search-bar">
    <i class="fas fa-search"></i>
    <input
      type="text"
      placeholder="搜索文件..."
      v-model="query"
      @input="handleSearch"
    />
    <button v-if="query" @click="clearSearch">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const query = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', query.value);
};

const clearSearch = () => {
  query.value = '';
  emit('search', '');
};
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 300px;
}

.search-bar i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

input {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  outline: none;
}

button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}
</style>