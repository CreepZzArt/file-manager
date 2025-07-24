<template>
  <div class="bg-gray-50 text-gray-900 flex h-screen overflow-hidden">
    <Sidebar @create-project="handleCreateProject"/>
    <main class="flex-1 flex flex-col overflow-hidden">
      <TopToolbar />
      <router-view />
    </main>
    <ContextMenu 
      v-show="contextMenu.visible"
      :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
      @close="contextMenu.visible = false"
    />
    <NewProjectModal ref="newProjectModalRef" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Sidebar from './components/layout/Sidebar.vue';
import TopToolbar from './components/layout/TopToolbar.vue';
import Breadcrumb from './components/files/Breadcrumb.vue';
import ContextMenu from './components/common/ContextMenu.vue';
import UploadModal from './components/modals/UploadModal.vue';
import NewProjectModal from './components/modals/NewProjectModal.vue'

const showUploadModal = ref(false);
const newProjectModalRef = ref()
const contextMenu = reactive({
  visible: false,
  top: 0,
  left: 0
});

// 处理右键菜单
const handleContextMenu = (e) => {
  e.preventDefault()
  contextMenu.visible = true
  contextMenu.top = e.clientY
  contextMenu.left = e.clientX
}

// 点击其他地方关闭菜单
const handleClickOutside = () => {
  contextMenu.visible = false;
};

function handleCreateProject() {
  newProjectModalRef.value?.open()
}

// onMounted(async () => {
//   const projectStore = useProjectStore()
//   const cleaned = await cleanInvalidProjects(projectStore.projects)
//   projectStore.setProjects(cleaned)
// })
</script>
<style>
.app-container{
  height: 100vh;
  width: 100vw;
}
</style>