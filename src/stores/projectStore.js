// src/stores/projectStore.js
import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProjectId: null,
    dialogVisible: false,
    newProject: {
      name: '',
      status: ''
    }
  }),
  actions: {
     // 清理无效的项目
    async cleanInvalidProjects() {
      const originalProjects = [...this.projects];
      const validProjects = [];
      const invalidProjects = []; // 用于存放失效的项目

      for (const project of originalProjects) {
        // 假设 window.electronAPI.checkPathExists 方法已经被正确暴露
        const res = await window.electronAPI.checkPathExists(project.name);
        if (res.success && res.exists) {
          validProjects.push(project);
        } else {
          // 如果项目文件夹不存在，则将其添加到失效项目列表
          invalidProjects.push(project);
        }
      }

      // 使用有效的项目更新状态
      this.projects = validProjects;
      this.saveProjects(); // 假设有保存项目列表到持久化存储的方法

      // 返回被移除的失效项目列表
      return invalidProjects;
    },
    // 从 localStorage 加载项目
    fetchProjects() {
      const data = localStorage.getItem('projects')
      if (data) {
        this.projects = JSON.parse(data)
      } else {
        this.projects = []
      }
    },

    // 添加新项目
    async addProject() {
      const name = this.newProject.name?.trim()
      const status = this.newProject.status?.trim()

      if (!name || !status) return

      // 检查是否存在同名项目（忽略大小写）
      const exists = this.projects.some(p => p.name.toLowerCase() === name.toLowerCase())
      if (exists) {
        alert(`项目名 "${name}" 已存在，请更换名称。`)
        return
      }

      // 调用主进程创建目录
      const res = await window.electronAPI.createProjectDir(name)
      if (!res.success) {
        console.error('创建目录失败:', res.error)
        alert(`无法创建项目文件夹：${res.error}`)
        return
      }

      // 正常添加项目
      const newItem = {
        id: Date.now(),
        name,
        status
      }
      this.projects.push(newItem)
      this.newProject = { name: '', status: '' }
      this.dialogVisible = false
      this.saveProjects()

      // ✅ 2. 自动跳转项目视图（建议用路由方式）
      router.push({ path: '/home', query: { project: newItem.id } })
    },

    // 设置当前选中的项目ID
    setCurrentProject(project) {
      this.currentProjectId = project.id
    },

    // 保存项目列表到 localStorage
    saveProjects() {
      localStorage.setItem('projects', JSON.stringify(this.projects))
    },

    clearProjects() {
      this.projects = []
      this.saveProjects() // 同步更新到 localStorage
    },
    
    setProjects(projects) {
      this.projects = projects
    },
    
    // 删除项目
    deleteProject(projectId) {
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.saveProjects();
      if(this.currentProjectId === projectId) {
        this.currentProjectId = null;
      }
    }

  },
  getters: {
    currentProject(state) {
      return state.projects.find(p => p.id === state.currentProjectId) || null
    }
  }

})
