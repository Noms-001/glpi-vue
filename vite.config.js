import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/glpi': {
        target: 'http://glpi.local',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/glpi/, '')
      }
    }
  }
})