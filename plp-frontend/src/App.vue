<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      // 页面加载完成后检查更新
      checkAppVersion();
      
      // 定期检查更新（每5分钟）
      setInterval(checkAppVersion, 5 * 60 * 1000);
    });
    
    // 检查应用版本
    const checkAppVersion = () => {
      // 获取当前版本信息
      fetch('/version.json', { 
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      .then(response => response.json())
      .then(versionInfo => {
        const currentCommitId = versionInfo.commitId;
        console.log('当前版本信息:', versionInfo);
        const localCommitId = localStorage.getItem('commitId');
        
        // 如果commit ID不同，则刷新页面
        if (localCommitId && localCommitId !== currentCommitId) {
          console.log('检测到新版本，正在刷新页面...');
          localStorage.setItem('commitId', currentCommitId);
          // 延迟刷新以确保localStorage更新完成
          setTimeout(() => {
            window.location.reload(true);
          }, 100);
        } else {
          localStorage.setItem('commitId', currentCommitId);
        }
      })
      .catch(err => {
        console.log('检查更新失败:', err);
        
        // fallback到原来的时间戳方式
        fetch('/', { 
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        .then(response => {
          const lastModified = response.headers.get('Last-Modified');
          if (lastModified) {
            const serverModifiedTime = new Date(lastModified).getTime();
            const localVisitTime = localStorage.getItem('lastVisitTime');
            
            // 如果服务器文件比上次访问时间更新，则刷新页面
            if (!localVisitTime || serverModifiedTime > parseInt(localVisitTime)) {
              console.log('检测到新版本，正在刷新页面...');
              localStorage.setItem('lastVisitTime', Date.now().toString());
              // 延迟刷新以确保localStorage更新完成
              setTimeout(() => {
                window.location.reload(true);
              }, 100);
            } else {
              localStorage.setItem('lastVisitTime', Date.now().toString());
            }
          }
        })
        .catch(err => {
          console.log('检查更新失败:', err);
        });
      });
    };
    
    return {
      checkAppVersion
    };
  }
}
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>