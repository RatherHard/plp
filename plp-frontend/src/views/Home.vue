<template>
  <div class="home-container">
    <HeaderComponent @show-instructions="showInstructions" />
    
    <div class="video-background">
      <video 
        v-if="currentVideo && videoExists"
        ref="backgroundVideo"
        class="background-video" 
        :src="currentVideo" 
        autoplay 
        :loop="shouldLoopVideo"
        muted
        @ended="onVideoEnded"
      ></video>
      <div v-else class="fallback-background"></div>
    </div>
    
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
    
    <el-dialog
      v-model="dialogVisible"
      title="网站说明"
      width="80%"
      center
    >
      <div class="instructions">
        <p v-for="(text, index) in instructionsText" :key="index">{{ text }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 首页不显示 Footer -->
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import { ElDialog, ElButton } from 'element-plus'
import store from '../store'

export default defineComponent({
  name: 'Home',
  components: {
    HeaderComponent,
    FooterComponent,
    ElDialog,
    ElButton
  },
  setup() {
    const router = useRouter()
    const backgroundVideo = ref(null)
    const dialogVisible = ref(false)
    const videos = [
      '/videos/Main.mp4'
    ]
    const currentVideoIndex = ref(0)
    const currentVideo = ref(videos[0])
    const videoExists = ref(false)
    const showNekoImage = ref(true)
    const showStartButton = ref(true)
    const shouldLoopVideo = ref(true)
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 检查视频文件是否存在
    const checkVideoExists = (videoPath) => {
      return fetch(videoPath)
        .then(response => response.ok)
        .catch(() => false)
    }
    
    onMounted(async () => {
      // 检查第一个视频是否存在
      videoExists.value = await checkVideoExists(currentVideo.value)
    })
    
    // 切换背景视频
    const changeVideo = async (videoPath, loop = true) => {
      // 更新视频路径
      currentVideo.value = videoPath
      shouldLoopVideo.value = loop
      
      // 检查视频是否存在
      videoExists.value = await checkVideoExists(currentVideo.value)
      
      // 如果视频存在，重新播放视频
      if (videoExists.value && backgroundVideo.value) {
        backgroundVideo.value.load()
        backgroundVideo.value.play()
      }
    }
    
    // 视频播放结束处理
    const onVideoEnded = () => {
      // 如果当前是CheckCheckBottle.mp4，则跳转到/view页面
      if (currentVideo.value === '/videos/CheckCheckBottle.mp4') {
        // 清空数据并将来源设置为来自他人
        store.clearAll()
        store.clearLocalStorage()
        store.updateSource(1)
        router.push('/view')
      }
    }
    
    // 处理开始按钮点击
    const handleStartButtonClick = () => {
      // 隐藏图片和按钮
      showNekoImage.value = false
      showStartButton.value = false
      
      // 设置firstFetch为1，表示这是通过主页按钮进入/view页面
      store.updateFirstFetch(1)
      
      // 切换到CheckCheckBottle.mp4视频，不循环播放
      changeVideo('/videos/CheckCheckBottle.mp4', false)
    }
    
    // 跳转到/select页面
    const goToSelect = () => {
      router.push('/select')
    }
    
    // 跳转到查看页面
    const goToView = () => {
      // 清空数据并将来源设置为来自他人
      store.clearAll()
      store.clearLocalStorage()
      store.updateSource(1)
      router.push('/view')
    }

    // 显示网站说明弹窗
    const showInstructions = () => {
      dialogVisible.value = true
    }
    
    return {
      backgroundVideo,
      currentVideo,
      videoExists,
      shouldLoopVideo,
      showNekoImage,
      showStartButton,
      changeVideo,
      handleStartButtonClick,
      onVideoEnded,
      goToSelect,
      goToView,
      dialogVisible,
      showInstructions,
      instructionsText
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

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background-image: url('/respic/Back.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.fallback-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0f2027, #203a43, #2c5364);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  background-image: url('/respic/Back.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.background-video {
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
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
  width: calc(40% + 100px);
  height: calc(53.33% + 150px);
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
