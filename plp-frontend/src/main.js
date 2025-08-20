import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

console.log('开始初始化应用...')

try {
  const app = createApp(App)

  app.use(ElementPlus)

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(router)

  // 确保在 DOM 加载完成后挂载应用
  router.isReady().then(() => {
    app.mount('#app')
    console.log('应用挂载成功')
  }).catch(error => {
    console.error('路由初始化失败:', error)
    app.mount('#app') // 即使路由初始化失败也尝试挂载应用
  })
} catch (error) {
  console.error('应用初始化失败:', error)
}