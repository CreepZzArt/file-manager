<template>
  <div style="height: 100vh;" class="w-64 bg-white border-r border-gray-200 flex flex-col ">
    <!-- 顶部标题部分保持不变 -->
    <div class="p-4 border-b border-gray-200 draggable">
      <h1 class="text-xl font-semibold text-indigo-600 flex items-center">
        <i class="fas fa-folder-open mr-2"></i> 项目资料管理
      </h1>
    </div>

    <!-- 中间可滚动区域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 新建项目按钮 -->
      <div class="p-4">
        <button @click="openNewProjectModal"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
          <i class="fas fa-plus mr-2"></i> 新建项目
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="px-2 space-y-1">
        <router-link v-for="item in navItems" :key="item.name" :to="item.path" custom v-slot="{ navigate, isActive }">
          <div @click="navigate" :class="[
            'px-3 py-2 rounded-md cursor-pointer flex items-center',
            isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'
          ]">
            <i :class="[item.icon, 'mr-3', item.iconColor]"></i>
            <span>{{ item.name }}</span>
          </div>
        </router-link>
      </nav>

      <!-- 我的项目 - 带滚动条的区域 -->
      <div class="mt-2 space-y-1 flex-1 overflow-y-auto custom-scroll">
    <!-- 项目列表内容... -->
     <div class="px-4 py-3 border-t border-gray-200 flex-1 flex flex-col min-h-0">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">我的项目</h3>
        <div class="mt-2 space-y-1 flex-1 overflow-y-auto">
          <div v-for="project in projects" :key="project.id" @click="selectProject(project)"
            class="px-3 py-2 rounded-md cursor-pointer flex items-center justify-between hover:bg-gray-100">
            <div class="flex items-center">
              <i class="fas fa-folder mr-3 text-amber-500"></i>
              <span>{{ project.name }}</span>
            </div>
            <span v-if="project.status" :class="[
              'ml-2 text-xs font-semibold px-2 py-0.5 rounded',
              statusClasses[project.status] || 'bg-gray-200 text-gray-600'
            ]">
              {{ statusLabels[project.status] || '未知' }}
            </span>
          </div>
        </div>
      </div>
      </div>
      
    </div>

    <!-- 底部用户信息保持不变 -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center">
        <img :src="user.avatar" alt="用户头像" class="h-8 w-8 rounded-full">
        <div class="ml-3">
          <p class="text-sm font-medium">{{ user.name }}</p>
          <p class="text-xs text-gray-500">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '../../stores/projectStore'
import { useUserStore } from '../../stores/useUserStore'
import { useFileStore } from '../../stores/fileStore'
import { onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const projectStore = useProjectStore()
const fileStore = useFileStore()
const userStore = useUserStore()
const emit = defineEmits(['create-project'])
const files = computed(() => fileStore.files)
const statusLabels = {
  active: '进行中',
  completed: '已完成',
  archived: '已归档'
}

const statusClasses = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600'
}

const { projects } = storeToRefs(projectStore)

onMounted(async () => {
  // 先从 localStorage 加载项目
  await projectStore.fetchProjects()

  // 然后清理掉无效的项目，并获取被移除的项目列表
  const removedProjects = await projectStore.cleanInvalidProjects()

  // 如果有项目被移除，则向用户显示提示
  if (removedProjects.length > 0) {
    const removedProjectNames = removedProjects.map(p => p.name).join(', ');
    // 你可以使用项目中的 UI 库（如 Element Plus, Naive UI）的通知组件来获得更好的体验
    // 这里为了简单起见，我们使用 alert
    ElMessage.error(`检测到项目文件夹不存在，已自动移除失效的项目: ${removedProjectNames}`);
  }

  console.log('清理后的项目列表:', projectStore.projects);
})

const { user } = storeToRefs(userStore)

const navItems = [
  { name: '所有文件', path: '/', icon: 'fas fa-home', iconColor: 'text-indigo-500' },
  { name: '收藏夹', path: '/favorites', icon: 'fas fa-star', iconColor: 'text-yellow-500' },
  { name: '最近访问', path: '/recent', icon: 'fas fa-clock', iconColor: 'text-blue-500' },
  { name: '回收站', path: '/trash', icon: 'fas fa-trash', iconColor: 'text-gray-500' }
]

const selectProject = async (project) => {
  // 检查项目文件夹是否存在
  const res = await window.electronAPI.checkPathExists(project.name);

  if (!res.exists) {
    ElMessage.error(`项目 "${project.name}" 的文件夹不存在，可能已被删除。`);
    // 重新清理一次列表
    await projectStore.cleanInvalidProjects();
    return;
  }

  projectStore.setCurrentProject(project);
  console.log(project, 'project');

  await router.replace({
    query: {
      project: project.id,
      path: ''
    }
  });

  await loadProjectFiles(project.id, '');
};

const loadProjectFiles = async (projectId, path = '') => {
  if (!projectId) {
    files.value = []
    fileStore.navigateTo('')
    return
  }

  const project = projectStore.projects.find(p => p.id == projectId)
  if (!project) {
    files.value = []
    fileStore.navigateTo('')
    return
  }

  projectStore.setCurrentProject(project)
  let dirPath = project.name
  if (path) {
    dirPath += '/' + path
  }

  const res = await window.electronAPI.readProjectDir(dirPath)
  if (res.success) {
    files.value = res.files
    fileStore.navigateTo(`data/${dirPath}`)
  } else {
    files.value = []
    console.error('读取目录失败:', res.error)
  }
}


const openNewProjectModal = () => {
  // 打开新建项目模态框逻辑
  emit('create-project')
}
</script>

<style scoped>
/* 保留你原有的样式 */
.sidebar-item:hover {
  background-color: rgba(253, 253, 253, 0.1);
}
</style>

<style>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #ffffff;
  border-radius: 4px;
}

/* 滚动条 */
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #e3e3e3;
  border-radius: 4px;
  border: 2px solid #f5f3ff;
}

/* 移动到滚动条的颜色  */
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #d3d3d3;
}
</style>