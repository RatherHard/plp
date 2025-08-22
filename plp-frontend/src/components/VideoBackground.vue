<template>
  <div class="video-background">
    <video 
      class="background-video" 
      :src="videoSrc" 
      autoplay 
      loop 
      muted
      v-if="videoSrc"
    ></video>
    <div v-else class="fallback-background"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'VideoBackground',
  watch: {
    videoPath: {
      handler(newValue) {
        this.videoSrc = newValue
      },
      immediate: true
    }
  },
  props: {
    videoPath: {
      type: String,
      default: '/videos/Main.mp4'
    }
  },
  setup(props) {
    const videoSrc = ref('')
    
    onMounted(async () => {
      try {
        // 检查视频文件是否存在
        const response = await fetch(props.videoPath, { method: 'GET' })
        if (response.ok) {
          videoSrc.value = props.videoPath
        }
      } catch (e) {
        // 视频检查失败时使用默认背景
      }
    })
    
    return {
      videoSrc
    }
  }
}
</script>

<style scoped>
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
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

.fallback-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>