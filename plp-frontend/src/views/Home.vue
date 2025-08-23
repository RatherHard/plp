<template>
  <div class="home-container">
    <HeaderComponent/>
    
    <VideoBackground :video-path="currentVideo" />
    
    <main class="main-content">
      <img 
        v-show="showNekoImage" 
        src="/respic/Neko.png" 
        alt="Neko" 
        class="center-image" 
      />
      <div 
        v-show="showStartButton" 
        class="start-button" 
        @click="handleStartButtonClick"
      ></div>
    </main>
    
    <!-- 右下角的方形不可见按钮 -->
    <div class="bottom-right-button" @click="goToSelect"></div>
    
    <!-- 右下角的图片 -->
    <img 
      src="/respic/Baka.png" 
      alt="Baka" 
      class="bottom-right-image" 
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '../components/Header.vue'
import store from '../store'
import VideoBackground from '../components/VideoBackground.vue'


export default defineComponent({
  name: 'Home',
  components: {
    HeaderComponent,
    VideoBackground
  },
  setup() {
    const router = useRouter()
    const backgroundVideo = ref(null)
    const dialogVisible = ref(false)
    const showNekoImage = ref(true)
    const showStartButton = ref(true)
    const currentVideo = ref('/videos/Main.mp4')
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 视频播放结束处理
    const onVideoEnded = () => {
      router.push('/view')
    }
    
    // 处理开始按钮点击
    const handleStartButtonClick = () => {
      // 隐藏图片和按钮
      showNekoImage.value = false
      showStartButton.value = false
      
      // 设置firstFetch为1，表示这是通过主页按钮进入/view页面
      store.updateFirstFetch(1)
      
      // 切换视频为Mai.mp4
      currentVideo.value = '/videos/CheckCheckBottle.mp4'
      
      // 跳转到查看页面
      setTimeout(() => {
        router.push('/view')
      }, 300)
    }
    
    // 跳转到/select-edit页面
    const goToSelect = () => {
      router.push('/select-edit')
    }
        
    return {
      backgroundVideo,
      dialogVisible,
      showNekoImage,
      showStartButton,
      instructionsText,
      currentVideo,
      onVideoEnded,
      handleStartButtonClick,
      goToSelect,
    }
  }
})
</script>

<style scoped>
.home-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-image {
  position: absolute;
  z-index: 1;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.start-button {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.bottom-right-button {
  position: fixed;
  bottom: 20px;
  right: 50px;
  width: 300px;
  height: 200px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.bottom-right-image {
  position: fixed;
  bottom: -180px;
  right: -105px;
  width: 600px;
  height: 600px;
  object-fit: contain;
  z-index: 5;
}
</style>
