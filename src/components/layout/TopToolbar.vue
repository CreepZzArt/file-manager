<template>
  <!-- 顶部工具栏 -->
  <div style="padding-top:0.6rem;padding-bottom: 0.5rem;" class="bg-white border-b border-gray-200 flex items-center justify-between px-4">
    <div style="display: flex;width: 100%;justify-content: space-between;margin-right: 10px;">
      <!-- 中间内容区域 -->
      <div class="flex items-center space-x-4">
        <!-- 标题 -->
        <h2 class="text-lg font-medium">所有文件</h2>

        <!-- 左侧按钮 -->
        <div class="flex space-x-2">
          <button class="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="刷新">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <!-- 右侧搜索 + 视图切换 -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input type="text" placeholder="搜索文件..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>

        <div class="flex space-x-2">
          <button class="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="网格视图">
            <i class="fas fa-th-large"></i>
          </button>
          <button class="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="列表视图">
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>


    <!-- 左侧窗口控制按钮 -->
    <div class="flex items-center space-x-2 non-draggable">
      <button @click="minimizeWindow" class="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="最小化">
        <i class="fas fa-minus"></i>
      </button>
      <button @click="maximizeWindow" class="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="最大化">
        <i class="fas fa-square"></i>
      </button>
      <button @click="closeWindow" class="p-2 rounded-md hover:bg-red-100 text-gray-600 hover:text-red-600" title="关闭">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    minimizeWindow() {
      window.electronAPI.ipcRenderer.send('window-control', 'minimize');
    },
    maximizeWindow() {
      window.electronAPI?.ipcRenderer.send('window-control', 'maximize');
    },
    closeWindow() {
      window.electronAPI?.ipcRenderer.send('window-control', 'close');
    }
  }
}
</script>

<style>
.draggable {
  -webkit-app-region: drag;
}

.non-draggable {
  -webkit-app-region: no-drag;
}
</style>