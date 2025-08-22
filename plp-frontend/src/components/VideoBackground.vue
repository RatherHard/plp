<template>
  <div class="video-background">
    <video 
      class="background-video" 
      :src="videoSrc" 
      autoplay 
      loop 
      muted
      v-if="videoSrc && !fallback"
      @error="handleVideoError"
    ></video>
    <div v-if="fallback" class="fallback-background">
      <img 
        src="/videos/fallback-frame.png" 
        alt="Fallback Background"
        @error="handleImageError"
        v-if="!imageError"
      >
      <div class="gradient-background" v-else></div>
    </div>
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
    let videoSrc = ref('')
    const fallback = ref(false)
    const imageError = ref(false)
    
    onMounted(async () => {
      try {
        // 检查视频文件是否存在
        const response = await fetch(props.videoPath, { method: 'HEAD' })
        if (response.ok) {
          videoSrc.value = props.videoPath
        } else {
          fallback.value = true
        }
      } catch (e) {
        fallback.value = true
      }
    })
    
    const handleVideoError = () => {
      fallback.value = true
    }
    
    const handleImageError = () => {
      imageError.value = true
    }
    
    return {
      videoSrc,
      fallback,
      imageError,
      handleVideoError,
      handleImageError
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
}

.fallback-background img { 
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.gradient-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #66bcea 0%, #122aff 100%);
}

.gradient-background::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}
</style>