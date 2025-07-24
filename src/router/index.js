import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import TrashView from '../views/TrashView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '所有文件' }
  },
  {
    path: '/editor',
    name: 'editor',
    // 我们将创建一个新的视图组件 TextEditor.vue
    component: () => import('../views/TextEditor.vue')
  },
  {
      path: '/markdown-editor',
      name: 'markdown-editor',
      component: () => import('../views/MarkdownEditor.vue')
  },
  {
    path: '/viewer',
    name: 'viewer',
    component: () => import('../views/FileViewer.vue')
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { title: '我的项目' }
  },
  {
    path: '/trash',
    name: 'trash',
    component: TrashView,
    meta: { title: '回收站' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 更新文档标题
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 文件管理` : '文件管理'
})

export default router