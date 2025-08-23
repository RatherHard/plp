import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

// 添加应用版本号
const APP_VERSION = '1.0.' + Date.now();

console.log('开始初始化应用...')

try {
  const app = createApp(App)

  app.use(ElementPlus)

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(router)

  // 挂载应用
  app.mount('#app')
  
  console.log('应用初始化完成，版本:', APP_VERSION)
  
  // 检查版本更新
  window.CHECK_VERSION = function() {
    return APP_VERSION;
  };
  
} catch (error) {
  console.error('应用初始化失败:', error)
}