<template>
  <div 
    v-if="visible"
    class="context-menu"
    :style="{ top: `${pos.y}px`, left: `${pos.x}px` }"
    ref="menuRef"
    @click.stop
  >
    <div class="menu-item" @click="handleAction('open')">
      <i class="fas fa-folder-open"></i> 打开
    </div>
    <div class="menu-item" @click="handleAction('rename')">
      <i class="fas fa-edit"></i> 重命名
    </div>
    <div class="menu-item" @click="handleAction('download')">
      <i class="fas fa-download"></i> 下载
    </div>
    <div class="divider"></div>
    <div class="menu-item delete" @click="handleAction('delete')">
      <i class="fas fa-trash-alt"></i> 删除
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'action'])

const menuRef = ref(null)
const pos = ref({ x: props.x, y: props.y }) // ✅ 用于最终定位

const handleAction = (action) => {
  emit('action', action)
  emit('close')
}

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close')
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    const menu = menuRef.value
    const rect = menu.getBoundingClientRect()
    const maxX = window.innerWidth
    const maxY = window.innerHeight

    let newX = props.x
    let newY = props.y

    if (newX + rect.width > maxX) {
      newX = maxX - rect.width - 5
    }
    if (newY + rect.height > maxY) {
      newY = maxY - rect.height - 5
    }

    pos.value = { x: newX, y: newY }

    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  overflow: auto;
  position: absolute;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  padding: 4px 0;
}
.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.menu-item:hover {
  background: #f5f5f5;
}
.menu-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}
.divider {
  height: 1px;
  background: #e8e8e8;
  margin: 4px 0;
}
.delete {
  color: #ff4d4f;
}
</style>
