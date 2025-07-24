<template>
  <!-- 遮罩层 -->
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <!-- 对话框主体 -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">新建项目</h3>
        <button @click="handleCancel" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 表单内容 -->
      <div class="p-6">
        <form @submit.prevent="handleSubmit">
          <!-- 项目名称 -->
          <div class="mb-6">
            <label style="display: flex;" class="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入项目名称"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
            <p v-if="!form.name && formTouched" class="mt-1 text-sm text-red-600">请输入项目名称</p>
          </div>
          
          <!-- 项目状态 -->
          <div class="mb-6">
            <label style="display: flex;" class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_0.5rem]"
              required
            >
              <option value="" disabled selected>请选择状态</option>
              <option 
                v-for="status in statusOptions" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
            <p v-if="!form.status && formTouched" class="mt-1 text-sm text-red-600">请选择状态</p>
          </div>
          
          <!-- 按钮组 -->
          <div class="flex justify-end space-x-3 pt-2"> 
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useProjectStore } from '../../stores/projectStore'

const visible = ref(false)
const formTouched = ref(false)
const form = reactive({
  name: '',
  status: ''
})

const statusOptions = [
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已归档', value: 'archived' },
]

const projectStore = useProjectStore()

function open() {
  visible.value = true
  formTouched.value = false
  form.name = ''
  form.status = ''
}

function handleCancel() {
  visible.value = false
  formTouched.value = false
  form.name = ''
  form.status = ''
}

function handleSubmit() {
  formTouched.value = true

  if (!form.name || !form.status) {
    return
  }

  // 先赋值给 store 的 newProject
  projectStore.newProject.name = form.name
  projectStore.newProject.status = form.status

  // 再调用 addProject，不传参数
  projectStore.addProject()
  console.log('当前项目列表:', projectStore.projects)  // 打印项目数组
  visible.value = false
}


defineExpose({ open })
</script>

<style>
/* 自定义下拉箭头 */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>