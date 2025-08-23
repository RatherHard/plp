<template>
  <div class="select-edit-container">
    <HeaderComponent/>
    
    <VideoBackground />
    
    <main class="main-content">
      <div class="content-layout">
        <el-steps :active="activeStep" finish-status="success" simple class="steps-container">
          <el-step title="选择载体和类型" />
          <el-step title="编辑内容" />
        </el-steps>
        
        <div class="step-content">
          <!-- 步骤1：选择载体和类型 -->
          <div v-show="activeStep === 0" class="step-panel">
            <div class="step-header">
              <h1 class="page-title">你要投出怎样的漂流瓶？</h1>
              <p class="page-subtitle">请选择合适的载体和幻想类型</p>
            </div>
            
            <el-card class="selection-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Document /></el-icon>
                  <span>请选择载体</span>
                </div>
              </template>
              
              <div class="radio-group">
                <el-radio-group v-model="selectedCarrier" class="radio-group-vertical">
                  <el-tooltip class="item" effect="dark" content="普通的纸，随心畅写，他人可补充幻想的内容" placement="bottom">
                    <el-radio label="牛皮纸" size="large" class="radio-item">
                      <div class="radio-content">
                        <div class="radio-title">牛皮纸</div>
                        <div class="radio-description">可编辑内容，他人可补充</div>
                      </div>
                    </el-radio>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="永恒的只读，扔出后内容不可再补充，他人仅可查阅、回应" placement="bottom">
                    <el-radio label="永恒纸" size="large" class="radio-item">
                      <div class="radio-content">
                        <div class="radio-title">永恒纸</div>
                        <div class="radio-description">只读内容，不可编辑</div>
                      </div>
                    </el-radio>
                  </el-tooltip>
                </el-radio-group>
              </div>
            </el-card>
            
            <el-card class="selection-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Lightning /></el-icon>
                  <span>请选择幻想类型</span>
                </div>
              </template>
              
              <div class="radio-group">
                <el-radio-group v-model="selectedFantasy" class="radio-group-vertical">
                  <el-tooltip class="item" effect="dark" content="你最多可以书写4000字的天马行空，不包含图片" placement="bottom">
                    <el-radio label="空想" size="large" class="radio-item">
                      <div class="radio-content">
                        <div class="radio-title">空想</div>
                        <div class="radio-description">纯文字内容，最多4000字</div>
                      </div>
                    </el-radio>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="你最多可以书写8000字的天马行空，还要附上几张相关图片哦" placement="bottom">
                    <el-radio label="联想" size="large" class="radio-item">
                      <div class="radio-content">
                        <div class="radio-title">联想</div>
                        <div class="radio-description">图文并茂，最多8000字+图片</div>
                      </div>
                    </el-radio>
                  </el-tooltip>
                </el-radio-group>
              </div>
            </el-card>
            
            <!-- 操作按钮 -->
            <div class="step-actions">
              <el-button 
                type="primary" 
                size="large" 
                @click="nextStep"
                :disabled="!selectedCarrier || !selectedFantasy"
                class="action-button"
              >
                下一步
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button 
                type="danger" 
                size="large" 
                @click="cancelSelection"
                class="action-button cancel-button"
              >
                <el-icon><Close /></el-icon>
                放弃
              </el-button>
            </div>
          </div>
          
          <!-- 步骤2：编辑内容 -->
          <div v-show="activeStep === 1" class="step-panel">
            <div class="step-header">
              <h1 class="page-title">编辑漂流瓶内容</h1>
              <p class="page-subtitle">请填写您的幻想内容</p>
            </div>
            
            <div class="content-display">
              <BottleEditor
                ref="editor"
                v-model="contentCopy"
                :show-image-upload="!!showImageUpload"
                :max-text-length="maxTextLength"
                :disable-image-actions="disableImageActions"
                :carrier-tag="carrierTag"
                :fantasy-tag="fantasyTag"
                @save="handleSave"
                @cancel="handleCancel"
              >
                <template #actions>
                  <div class="editor-actions">
                    <el-button @click="prevStep" class="action-button">
                      <el-icon><ArrowLeft /></el-icon>
                      上一步
                    </el-button>
                    <el-button type="primary" @click="saveContent" class="action-button">
                      <el-icon><Check /></el-icon>
                      保存
                    </el-button>
                    <el-button type="danger" @click="showCancelDialog" class="action-button">
                      <el-icon><Close /></el-icon>
                      放弃
                    </el-button>
                  </div>
                </template>
              </BottleEditor>
            </div>
          </div>
        </div>
      </div>
      
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
    </main>
    
    <FooterComponent />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, ArrowLeft, Close, Document, Lightning, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElSteps, ElStep } from 'element-plus'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import VideoBackground from '../components/VideoBackground.vue'
import BottleEditor from '../components/BottleEditor.vue'
import store from '../store'
import { 
  getCarrierTag, 
  getFantasyTag, 
  shouldShowImageUpload, 
  getMaxTextLength 
} from '../utils'

export default {
  name: 'SelectEdit',
  components: {
    HeaderComponent,
    FooterComponent,
    VideoBackground,
    BottleEditor,
    ArrowRight,
    ArrowLeft,
    Close,
    Document,
    Lightning,
    Check,
    ElSteps,
    ElStep
  },
  setup() {
    const router = useRouter()
    const activeStep = ref(0)
    const dialogVisible = ref(false)
    const editor = ref(null)
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 用户选择状态
    const selectedCarrier = ref('') // 载体选择
    const selectedFantasy = ref('') // 幻想类型选择
    
    // 计算载体标签显示内容
    const carrierTag = computed(() => {
      try {
        const carrier = selectedCarrier.value === '牛皮纸' ? 0 : 1;
        return getCarrierTag(carrier);
      } catch (e) {
        // 出现错误时返回默认值
        return getCarrierTag(0);
      }
    })
    
    // 计算幻想类型标签显示内容
    const fantasyTag = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        return getFantasyTag(fantasy);
      } catch (e) {
        // 出现错误时返回默认值
        return getFantasyTag(0);
      }
    })
    
    // 根据幻想类型判断是否显示图片上传功能
    const showImageUpload = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        return shouldShowImageUpload(fantasy);
      } catch (e) {
        // 默认显示图片上传功能（联想）
        return true;
      }
    })
    
    // 根据幻想类型获取文本最大字数
    const maxTextLength = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        return getMaxTextLength(fantasy);
      } catch (e) {
        // 默认为联想的字数限制
        return getMaxTextLength(1);
      }
    })
    
    // 当source为1时禁用图片上传和删除功能
    const disableImageActions = computed(() => {
      try {
        const source = store.getSource();
        return source === 1;
      } catch (e) {
        return false;
      }
    })
    
    // 创建内容副本用于编辑
    const contentCopy = ref({
      carrier: 0,
      fantasy: 0,
      title: '',
      text: '',
      images: []
    })
    
    // 步骤控制
    const nextStep = () => {
      if (selectedCarrier.value && selectedFantasy.value) {
        // 清空本地存储的文本和图片内容
        store.clearAll()
        store.clearLocalStorage()
        
        // 将文本选项转换为数字编码并存储到共享状态
        // 载体: "牛皮纸"记为0，"永恒纸"记为1
        const carrierCode = selectedCarrier.value === '牛皮纸' ? 0 : 1;
        
        // 幻想类型: "空想"记为0，"联想"记为1
        const fantasyCode = selectedFantasy.value === '空想' ? 0 : 1;
        
        // 更新副本中的载体和幻想类型
        contentCopy.value.carrier = carrierCode
        contentCopy.value.fantasy = fantasyCode
        
        activeStep.value++
      }
    }
    
    const prevStep = () => {
      activeStep.value--
    }
    
    // 保存内容
    const handleSave = (content) => {
      // 检查如果是联想类型(fantasy不为0)，则必须有图片
      const fantasy = content.fantasy;
      const images = content.images;
      
      if (fantasy !== 0 && images.length === 0) {
        ElMessage.error('联想类型的内容必须包含至少一张图片！');
        return;
      }
      
      // 使用content完全覆盖共享状态
      store.updateContent(content);
      
      // 设置ifEdit为1（因为是新内容）
      store.updateIfEdit(1);
      
      // 保存内容逻辑（现在由store自动处理本地存储）
      ElMessage.success('内容已保存!')
      router.push('/view')
    }
    
    // 直接调用编辑器的保存方法
    const saveContent = () => {
      if (editor.value) {
        editor.value.saveContent()
      }
    }
    
    // 显示放弃确认弹窗
    const showCancelDialog = () => {
      if (editor.value) {
        editor.value.showCancelDialog()
      }
    }
    
    // 放弃选择并返回首页
    const cancelSelection = () => {
      router.push('/')
    }
    
    // 取消编辑处理函数
    const handleCancel = () => {
      router.go(-1)
    }
    
    return {
      activeStep,
      selectedCarrier,
      selectedFantasy,
      contentCopy,
      dialogVisible,
      editor,
      instructionsText,
      carrierTag,
      fantasyTag,
      showImageUpload,
      maxTextLength,
      disableImageActions,
      nextStep,
      prevStep,
      handleSave,
      saveContent,
      showCancelDialog,
      cancelSelection,
      handleCancel
    }
  }
}
</script>

<style scoped>
.select-edit-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  position: relative;
  top: 85px;
  height: calc(100vh - 160px);
  padding: 80px 20px 50px;
  overflow-y: auto;
}

.content-layout {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
}

.steps-container {
  margin-bottom: 30px;
}

.step-content {
  margin-top: 20px;
}

.step-panel {
  padding: 10px 0;
}

.step-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.selection-card {
  margin-bottom: 25px;
  border-radius: 10px;
  border: 1px solid #e6e6e6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

.card-header .el-icon {
  margin-right: 10px;
  font-size: 20px;
}

.radio-group-vertical {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.radio-item {
  height: 60px !important;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.radio-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

:deep(.radio-item .el-radio__input) {
  float: right;
  margin-left: 15px;
}

.radio-content {
  flex: 1;
  min-width: 0;
}

.radio-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.radio-description {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.action-button {
  font-size: 16px;
  padding: 15px 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.content-display {
  margin-bottom: 25px;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 30px;
}

.editor-actions :deep(.el-button) {
  font-size: 16px;
  padding: 12px 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>