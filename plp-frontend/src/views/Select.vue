<template>
  <div class="select-container">
    <HeaderComponent @show-instructions="showInstructions" />
    
    <div class="video-background">
      <video 
        class="background-video" 
        :src="videoSource" 
        autoplay 
        loop 
        muted
        v-if="videoSource"
      ></video>
    </div>
    
    <main class="main-content">
      <div class="selection-container">
        <h1 class="page-title">选择您的漂流瓶配置</h1>
        
        <!-- 第一个单选组：载体选择 -->
        <div class="selection-group">
          <div class="group-header">
            <h2 class="group-title">请选择载体</h2>
            <el-button 
              type="info" 
              icon="QuestionFilled" 
              circle 
              @click="showCarrierHelp"
              class="help-button"
            />
          </div>
          
          <div class="radio-group">
            <el-radio-group v-model="selectedCarrier">
              <el-radio label="牛皮纸" size="large">牛皮纸</el-radio>
              <el-radio label="永恒纸" size="large">永恒纸</el-radio>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 第二个单选组：幻想类型选择 -->
        <div class="selection-group">
          <div class="group-header">
            <h2 class="group-title">请选择幻想类型</h2>
            <el-button 
              type="info" 
              icon="QuestionFilled" 
              circle 
              @click="showFantasyHelp"
              class="help-button"
            />
          </div>
          
          <div class="radio-group">
            <el-radio-group v-model="selectedFantasy">
              <el-radio label="空想" size="large">空想</el-radio>
              <el-radio label="联想" size="large">联想</el-radio>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 确认按钮 -->
        <div class="confirm-section">
          <el-button 
            type="primary" 
            size="large" 
            @click="confirmSelection"
            :disabled="!selectedCarrier || !selectedFantasy"
          >
            确认
          </el-button>
          <el-button 
            type="danger" 
            size="large" 
            @click="cancelSelection"
            class="cancel-button"
          >
            放弃
          </el-button>
        </div>
      </div>
    </main>
    
    <!-- 载体帮助说明弹窗 -->
    <el-dialog
      v-model="carrierHelpVisible"
      title="载体说明"
      width="80%"
      center
    >
      <div class="help-content">
        <h3>牛皮纸</h3>
        <p>普通的纸，随心畅写，他人可补充幻想的内容</p>
        
        <h3>永恒纸</h3>
        <p>扔出后内容不可再补充，他人仅可查阅、回应</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="carrierHelpVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 幻想类型帮助说明弹窗 -->
    <el-dialog
      v-model="fantasyHelpVisible"
      title="幻想类型说明"
      width="80%"
      center
    >
      <div class="help-content">
        <h3>空想</h3>
        <p>允许用户发布不超过4000字的内容，不包含图片</p>
        <p>没有其余特殊要求，自由发挥吧~</p>
        
        <h3>联想</h3>
        <p>允许用户发布不超过8000字的内容，必须包含图片</p>
        <p>文本内容必须和图片的内容有强相关性</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="fantasyHelpVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 网站说明弹窗 -->
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
    
    <FooterComponent />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import { ElButton, ElRadioGroup, ElRadio, ElDialog, ElMessage } from 'element-plus'
import store from '../store'

export default {
  name: 'Select',
  components: {
    HeaderComponent,
    FooterComponent,
    ElButton,
    ElRadioGroup,
    ElRadio,
    ElDialog,
    ElMessage
  },
  setup() {
    const router = useRouter()
    
    // 网站说明弹窗显示状态
    const dialogVisible = ref(false)
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 检查视频文件是否存在，如果不存在则使用默认颜色背景
    const videoSource = ref('')
    onMounted(() => {
      try {
        fetch('/videos/Main.mp4')
          .then(response => {
            if (response.ok) {
              videoSource.value = '/videos/Main.mp4'
            } else {
              videoSource.value = ''
            }
          })
          .catch(() => {
            videoSource.value = ''
          })
      } catch (e) {
        videoSource.value = ''
      }
    })
    
    // 用户选择状态
    const selectedCarrier = ref('') // 载体选择
    const selectedFantasy = ref('') // 幻想类型选择
    
    // 帮助弹窗显示状态
    const carrierHelpVisible = ref(false)
    const fantasyHelpVisible = ref(false)
    
    // 显示载体帮助弹窗
    const showCarrierHelp = () => {
      carrierHelpVisible.value = true
    }
    
    // 显示幻想类型帮助弹窗
    const showFantasyHelp = () => {
      fantasyHelpVisible.value = true
    }

    // 返回首页
    const goToHome = () => {
      router.push('/')
    }

    // 显示网站说明弹窗
    const showInstructions = () => {
      dialogVisible.value = true
    }
    
    // 确认选择并跳转到编辑页面
    const confirmSelection = () => {
      if (selectedCarrier.value && selectedFantasy.value) {
        // 清空本地存储的文本和图片内容
        store.clearAll()
        store.clearLocalStorage()
        
        // 将文本选项转换为数字编码并存储到共享状态
        // 载体: "平凡纸"记为0，"金刚纸"记为1
        const carrierCode = selectedCarrier.value === '平凡纸' ? 0 : 1;
        
        // 幻想类型: "空想"记为0，"联想"记为1
        const fantasyCode = selectedFantasy.value === '空想' ? 0 : 1;
        
        // 更新共享状态中的载体和幻想类型
        store.updateCarrier(carrierCode)
        store.updateFantasy(fantasyCode)
        
        // 跳转到编辑页面（不通过路由参数传递数据）
        router.push('/edit')
      }
    }
    
    // 放弃选择并返回首页
    const cancelSelection = () => {
      router.push('/')
    }
    
    return {
      videoSource,
      selectedCarrier,
      selectedFantasy,
      carrierHelpVisible,
      fantasyHelpVisible,
      showCarrierHelp,
      showFantasyHelp,
      confirmSelection,
      cancelSelection,
      dialogVisible,
      showInstructions,
      instructionsText,
      goToHome
    }
  }
}
</script>

<style scoped>
.select-container {
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
  background: linear-gradient(45deg, #0f2027, #203a43, #2c5364);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
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
  opacity: 0.8;
}

.main-content {
  position: relative;
  height: calc(100vh - 100px);
  padding: 80px 20px 50px;
  overflow-y: auto;
}

.selection-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.selection-group {
  margin-bottom: 30px;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.group-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  flex-grow: 1;
}

.help-button {
  margin-left: 10px;
  background: #409eff;
  border: none;
  color: white;
}

.help-button:hover {
  background: #66b1ff;
}

.radio-group {
  padding: 15px 0;
}

.radio-group :deep(.el-radio) {
  display: block;
  margin-bottom: 10px;
}

.radio-group :deep(.el-radio__label) {
  font-size: 16px;
  color: #555;
}

.confirm-section {
  text-align: center;
  margin-top: 30px;
}

.confirm-section :deep(.el-button) {
  font-size: 18px;
  padding: 20px 40px;
  border-radius: 10px;
  margin: 0 10px;
}

.cancel-button {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.help-content h3 {
  margin: 15px 0 5px;
  color: #333;
}

.help-content p {
  margin: 5px 0 15px;
  color: #666;
  line-height: 1.6;
}
</style>