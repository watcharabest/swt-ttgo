import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'

export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      '/images': {
        target: 'https://10.85.163.101:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __API_BASE_URL__: JSON.stringify('https://10.85.163.101:8000'),
  },
})
