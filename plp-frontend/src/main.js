import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

// 应用版本信息将从version.json获取
let APP_VERSION = 'unknown';

// 异步获取版本信息
fetch('/version.json')
  .then(response => response.json())
  .then(versionInfo => {
    APP_VERSION = versionInfo.commitId;
    console.log('应用版本:', APP_VERSION);
  })
  .catch(err => {
    console.error('获取版本信息失败:', err);
    APP_VERSION = 'unknown';
  });

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
  
  console.log('应用初始化完成')
  
  // 检查版本更新
  window.CHECK_VERSION = function() {
    return APP_VERSION;
  };
  
} catch (error) {
  console.error('应用初始化失败:', error)
}