import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  build: {
    // 为静态资源添加哈希值以防止缓存
    rollupOptions: {
      output: {
        // 为入口文件添加哈希值
        entryFileNames: 'assets/[name].[hash].js',
        // 为块文件添加哈希值
        chunkFileNames: 'assets/[name].[hash].js',
        // 为CSS文件添加哈希值
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})