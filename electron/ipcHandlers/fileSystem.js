// src/main/ipcHandlers/fileSystem.js
import fs from 'fs-extra';
import path from 'path';
import { app, ipcMain, dialog } from 'electron';

const baseDataDir = path.join(process.cwd(), 'data')
export function registerFileSystemHandlers() {
  ipcMain.handle('read-dir', async (_, dirPath) => {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) throw new Error('目标路径不是目录');

      const files = await fs.readdir(dirPath);
      return Promise.all(files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          isDirectory: stats.isDirectory()
        };
      }));
    } catch (error) {
      console.error('[read-dir] 读取目录失败:', error);
      throw error;
    }
  });

  ipcMain.handle('get-file-info', async (_, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        modified: stats.mtime,
        path: filePath,
        name: path.basename(filePath)
      };
    } catch (error) {
      console.error('[Main] 获取文件信息失败:', error);
      throw error;
    }
  });

  ipcMain.handle('save-files', async (_, { files, targetPath }) => {
    try {
      await fs.ensureDir(targetPath);
      const results = [];

      for (const file of files) {
        try {
          const destPath = path.join(targetPath, file.name);

          if (await fs.pathExists(destPath)) {
            const { response } = await dialog.showMessageBox({
              type: 'question',
              buttons: ['覆盖', '跳过', '取消'],
              title: '文件已存在',
              message: `文件 "${file.name}" 已存在，如何处理？`
            });

            if (response === 2) throw new Error('用户取消上传');
            if (response === 1) {
              results.push({ name: file.name, status: 'skipped' });
              continue;
            }
          }

          await fs.move(file.path, destPath, { overwrite: true });
          results.push({ name: file.name, status: 'success', path: destPath });
        } catch (error) {
          results.push({ name: file.name, status: 'error', message: error.message });
        }
      }

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('upload-files', async (_, { files, targetDir }) => {
    try {
      console.log('收到上传请求，targetDir:', targetDir);
      console.log('收到文件列表:', files);
      // 定义基础目录，假设你的项目文件都放 data 文件夹下
      const baseDir = path.join(process.cwd(), 'data')
      // 拼接成完整的项目目录路径
      const projectDir = path.join(baseDir, targetDir)

      // 确保项目目录存在
      await fs.ensureDir(projectDir)

      const results = []

      for (const file of files) {
        try {
          // 校验文件路径合法且存在
          if (!file.path || !(await fs.pathExists(file.path))) {
            throw new Error('文件路径无效或文件不存在')
          }

          // 目标路径
          const destPath = path.join(projectDir, file.name)

          // 文件已存在时，弹出对话框让用户选择操作
          if (await fs.pathExists(destPath)) {
            const { response } = await dialog.showMessageBox({
              type: 'question',
              buttons: ['覆盖', '跳过', '取消'],
              title: '文件已存在',
              message: `文件 "${file.name}" 已存在，如何处理？`
            })

            if (response === 2) throw new Error('用户取消上传')
            if (response === 1) {
              results.push({ name: file.name, status: 'skipped' })
              continue
            }
          }

          // 复制文件，允许覆盖
          await fs.copy(file.path, destPath, { overwrite: true })
          results.push({ name: file.name, status: 'success', path: destPath })
        } catch (error) {
          results.push({ name: file.name, status: 'failed', error: error.message })
        }
      }

      return { success: true, results }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('create-project-dir', async (event, projectName) => {
    try {
      const projectDir = path.join(baseDataDir, projectName)
      await fs.ensureDir(projectDir)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('read-project-dir', async (event, projectName) => {
    const projectDir = path.join(baseDataDir, projectName);
    try {
      const files = await fs.readdir(projectDir);
      const fileInfos = await Promise.all(files.map(async (file) => {
        const filePath = path.join(projectDir, file);
        const stat = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          isDirectory: stat.isDirectory()
        };
      }));
      return { success: true, files: fileInfos };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('ensure-data-dir', async () => {
    try {
      let dataDir;
      if (app.isPackaged) {
        // 打包后：data目录放在程序目录同级
        dataDir = path.join(path.dirname(process.resourcesPath), 'data');
      } else {
        // 开发环境：通常放在项目根目录下的data文件夹
        dataDir = path.join(process.cwd(), 'data');
      }

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      return { success: true, path: dataDir };
    } catch (error) {
      console.error('创建 data 文件夹失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-file', async (event, filePath) => {
    try {
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('文件不存在')
      }
      await fs.promises.unlink(filePath)
      return { success: true }
    } catch (err) {
      console.error('删除文件出错:', err)
      throw err
    }
  })

  ipcMain.handle('check-path-exists', async (event, dirPath) => {
    try {
      const exists = await fs.pathExists(path.join(baseDataDir, dirPath));
      return { success: true, exists };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 新增：用于读取文本文件内容
ipcMain.handle('read-text-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return { success: false, error: error.message };
  }
});

// 新增：用于保存文本文件内容
ipcMain.handle('save-text-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error(`保存文件失败: ${filePath}`, error);
    return { success: false, error: error.message };
  }
});

// 新增: 根据一个文件的完整路径，获取其所在目录的相对路径
ipcMain.handle('get-relative-dir-path', (event, fullFilePath) => {
  try {
    // 1. 从文件的完整路径获取其所在目录的路径
    const dirPath = path.dirname(fullFilePath);
    // 2. 计算该目录相对于基础数据目录的路径
    const relativePath = path.relative(baseDataDir, dirPath);
    return { success: true, relativePath: relativePath.replace(/\\/g, '/') }; // 统一使用 / 分隔符
  } catch (error) {
    console.error('get-relative-dir-path 失败:', error);
    return { success: false, error: error.message };
  }
});

// 读取文件为Buffer的IPC调用
ipcMain.handle('read-file-as-buffer', async (event, filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    return null; // 或者返回错误信息
  }
});

ipcMain.handle('open-path-in-shell', (event, fullPath) => {
  shell.openPath(fullPath);
});
  console.log('File system handlers registered');
}