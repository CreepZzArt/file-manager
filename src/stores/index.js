// src/stores/index.js

import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia  // ✅ 这个非常关键

export * from './useFileStore'
export * from './projectStore'
export * from './useUserStore'
