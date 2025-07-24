<template>
  <div class="home-view">
    <ActionBar
      :has-selection="fileStore.selectedFiles.length > 0"
      @upload="showUploadModal = true"
      @newFolder="handleNewFolder"
      @delete="handleDelete"
    />

    <Breadcrumb style="display: flex" />

    <FileGrid
      :files="files"
      :view-mode="fileStore.viewMode"
      @select="fileStore.selectFile($event, $event.ctrlKey)"
      @open="handleFileOpen"
      @contextmenu="handleContextMenu"
    />

    <UploadModal
      v-if="showUploadModal"
      :projectName="projectStore.currentProject?.name || ''"
      @close="showUploadModal = false"
      @upload-success="handleUploadSuccess"
    />

    <NewProjectDialog ref="dialogRef" @project-created="handleProjectCreated" />

    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      @close="contextMenuVisible = false"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFileStore } from "../stores/fileStore";
import { useProjectStore } from "../stores/projectStore";

import ActionBar from "../components/layout/ActionBar.vue";
import Breadcrumb from "../components/files/Breadcrumb.vue";
import FileGrid from "../components/files/FileGrid.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import ShareModal from "../components/modals/ShareModal.vue";
import ContextMenu from "../components/common/ContextMenu.vue";
import NewProjectDialog from "../components/modals/NewProjectModal.vue";

const route = useRoute();
const router = useRouter();
const fileStore = useFileStore();
const projectStore = useProjectStore();

const showUploadModal = ref(false);
const showShareModal = ref(false);
const loading = ref(false);
const files = computed(() => fileStore.files);

// ✅ 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const currentProject = computed(() => {
  return projectStore.projects.find((p) => p.id == route.query.project);
});

const loadProjectFiles = async (projectId, path = "") => {
  if (!projectId) {
    files.value = [];
    fileStore.navigateTo("");
    return;
  }

  const project = projectStore.projects.find((p) => p.id == projectId);
  if (!project) {
    files.value = [];
    fileStore.navigateTo("");
    return;
  }

  projectStore.setCurrentProject(project);
  let dirPath = project.name;
  if (path) {
    dirPath += "/" + path;
  }

  const res = await window.electronAPI.readProjectDir(dirPath);
  if (res.success) {
    files.value = res.files;
    fileStore.navigateTo(`data/${dirPath}`);
  } else {
    files.value = [];
    console.error("读取目录失败:", res.error);
  }
};

onMounted(async () => {
  const result = await window.electronAPI.ensureDataDir();
  if (!result.success) {
    console.error("创建 data 文件夹失败:", result.error);
    return;
  }
  loadProjectFiles();
  loadFilesByDir("");
});

watch(
  () => [route.query.project, route.query.path],
  async ([projectId, path]) => {
    await loadProjectFiles(projectId, path);
  },
  { immediate: true }
);

const loadFilesByDir = async (fullRelativePath) => {
  loading.value = true;
  const res = await window.electronAPI.readProjectDir(fullRelativePath);
  if (res.success) {
    files.value = res.files;
    fileStore.navigateTo(`data/${fullRelativePath}`);
  } else {
    console.error("读取目录失败:", res.error);
  }
  loading.value = false;
};

const handleProjectCreated = (newProject) => {
  router.replace({ query: { project: newProject.id } });
};

const handleFileOpen = (file) => {
  if (!file.isDirectory) return;

  // 当前 query.project 必须存在
  const projectId = route.query.project;
  if (!projectId) return;

  // 计算新的 path
  let newPath = route.query.path || "";
  if (newPath) {
    newPath = `${newPath}/${file.name}`;
  } else {
    newPath = file.name;
  }

  // 更新路由 query，触发 watch 加载文件
  router.replace({
    query: {
      ...route.query,
      path: newPath,
    },
  });
};

const handleUploadSuccess = () => {
  loadProjectFiles();
};

const handleNewFolder = async () => {
  const name = prompt("请输入文件夹名称");
  if (name) {
    const path = `${fileStore.currentPath}/${name}`;
    const res = await window.electronAPI.createDir(path);
    if (res.success) {
      loadProjectFiles();
    } else {
      alert("创建文件夹失败");
    }
  }
};

const handleDelete = async () => {
  if (confirm("确定要删除选中的文件吗？")) {
    const paths = fileStore.selectedFiles.map((f) => f.path);
    const res = await window.electronAPI.deleteFiles(paths);
    if (res.success) {
      loadProjectFiles();
    } else {
      alert("删除失败");
    }
  }
};

const handleDownload = async () => {
  const paths = fileStore.selectedFiles.map((f) => f.path);
  const res = await window.electronAPI.downloadFiles(paths);
  if (!res.success) {
    alert("下载失败");
  }
};

// ✅ 显示右键菜单
const handleContextMenu = ({ file, event }) => {
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
  fileStore.selectFile(file);
};

// ✅ 处理右键菜单点击的动作
import { ElMessageBox, ElMessage } from "element-plus";

const handleContextMenuAction = async (action) => {
  console.log("右键菜单动作：", action);
  contextMenuVisible.value = false;
  const selected = fileStore.selectedFiles;

  if (selected.length === 0) {
    ElMessage.warning("请先选择要操作的文件或文件夹");
    return;
  }

  // 使用 switch 结构处理所有动作
  switch (action) {
    case "open":
      // "打开"逻辑，针对单个文件
      const fileToOpen = selected[0];
      if (fileToOpen.isDirectory) {
        fileStore.navigateTo(fileToOpen.path);
      } else {
        if (fileToOpen.name.toLowerCase().endsWith(".md")) {
          // 如果是 .md 文件，跳转到 Markdown 编辑器
          router.push({ name: 'markdown-editor', query: { path: fileToOpen.path } });
        } else if (fileToOpen.name.toLowerCase().endsWith(".txt")) {
          router.push({ name: "editor", query: { path: fileToOpen.path } });
        } else {
          router.push({ name: 'viewer', query: { path: fileToOpen.path } });
          // alert(`暂不支持打开 '${fileToOpen.name}' 类型的文件。`);
        }
      }
      break;

    case "delete":
      // --- 这里是你的、可以正常工作的删除逻辑，原封不动地整合进来 ---
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selected.length} 个文件吗？`,
          "删除确认",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const fileToGetPathFrom = selected[0];
        const failedToDelete = [];
        const skippedFolders = [];

        for (const file of selected) {
          if (!file.path) {
            console.warn("文件缺少 path，跳过：", file);
            continue;
          }

          if (file.isDirectory) {
            skippedFolders.push(file.name || file.path);
            continue;
          }

          try {
            // **使用你原来的、正确的API调用**
            await window.electronAPI.deleteFile(file.path);
          } catch (err) {
            console.error("删除失败：", err);
            failedToDelete.push(file.name || file.path);
          }
        }

        let message = "删除操作已完成";
        let messageType = "success";

        let details = [];
        if (failedToDelete.length > 0) {
          details.push(`以下文件删除失败: ${failedToDelete.join("，")}`);
          messageType = "warning";
        }
        if (skippedFolders.length > 0) {
          details.push(`已跳过文件夹: ${skippedFolders.join("，")}`);
          messageType = "info";
        }

        if (details.length > 0) {
          message += "。" + details.join("；");
        }

        ElMessage({
          message: message,
          type: messageType,
        });

        const res = await window.electronAPI.getRelativeDirPath(
          fileToGetPathFrom.path
        );
        if (res.success) {
          // 使用返回的、绝对正确的相对路径来刷新列表
          await loadFilesByDir(res.relativePath);
        } else {
          // 如果失败，提供一个回退方案，比如刷新项目根目录
          console.error("无法获取相对路径，将刷新项目根目录:", res.error);
          await loadFilesByDir(projectStore.currentProject?.name || "");
        }
      } catch (error) {
        // 当用户点击 "取消" 或关闭弹窗时，ElMessageBox.confirm 会 reject 一个 'cancel' 字符串
        if (error === "cancel") {
          ElMessage.info("已取消删除");
        } else {
          console.error("删除流程中出现未预料的错误:", error);
          ElMessage.error("删除过程中发生错误");
        }
      }
      break;
    case 'edit':
      const fileToEdit = selected[0];
      const ext = fileToEdit.name.split('.').pop().toLowerCase();
      if (['md', 'markdown'].includes(ext)) {
          router.push({ name: 'markdown-editor', query: { path: fileToEdit.path } });
      } else if (['txt', 'json', 'js', 'css', 'html'].includes(ext)) { // 可编辑的文本类型
          router.push({ name: 'editor', query: { path: fileToEdit.path } });
      } else {
          ElMessage.info('此文件类型不支持在应用内编辑。');
      }
      break;
    // 你可以继续在这里添加 'rename', 'copy' 等 case
    default:
      console.warn(`未知的操作: ${action}`);
      break;
  }
};
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
