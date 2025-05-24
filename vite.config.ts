import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      // ทุก request ที่ขึ้นต้น /images จะถูกยิงไปยัง backend:8000
      '/images': {
        target: 'http://192.168.1.218:8000',
        changeOrigin: true,
        // (ถ้า backend ไม่ต้องการ /images นำหน้าก็ uncomment บรรทัดด้านล่าง)
        // rewrite: path => path.replace(/^\/images/, '')
      }
    }
  }
})