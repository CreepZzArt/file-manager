// // vite.config.js
// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [vue()],
//   base: './',
//   build: {
//     outDir: 'dist',
//     emptyOutDir: true
//   }
// })


// 以上为打包使用
// 以下为生成环境

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron/main.js',
      },
      preload: {
        input: 'electron/preload.js',
      }
    }),
  ],
})
