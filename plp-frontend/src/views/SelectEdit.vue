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
              <el-card class="content-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Edit /></el-icon>
                    <span>内容编辑</span>
                    <div class="content-tags">
                      <el-tag class="tag" :type="carrierTag.type">{{ carrierTag.text }}</el-tag>
                      <el-tag class="tag" :type="fantasyTag.type">{{ fantasyTag.text }}</el-tag>
                    </div>
                  </div>
                </template>
                
                <div class="editor-section">
                  <div class="input-label">
                    <el-icon><Document /></el-icon>
                    标题
                  </div>
                  <el-input
                    v-model="displayTitle"
                    placeholder="请输入标题（不超过20字）"
                    class="title-editor"
                    maxlength="20"
                    show-word-limit
                  />
                </div>
                
                <div class="editor-section">
                  <div class="input-label">
                    <el-icon><Document /></el-icon>
                    正文
                  </div>
                  <el-input
                    v-model="content.text"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入漂流瓶的文字内容..."
                    class="text-editor"
                    :maxlength="maxTextLength"
                    show-word-limit
                  />
                </div>
                
                <div class="image-upload-section" v-if="showImageUpload">
                  <div class="input-label">
                    <el-icon><Picture /></el-icon>
                    上传图片
                  </div>
                  <el-upload
                    class="image-uploader"
                    action=""
                    :auto-upload="false"
                    :file-list="fileList"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    :on-preview="handlePreview"
                    list-type="picture-card"
                    :disabled="disableImageActions"
                  >
                    <el-icon v-if="!disableImageActions"><Plus /></el-icon>
                    <div class="el-upload__text" v-if="!disableImageActions">
                      <em>点击上传</em>
                    </div>
                    <div class="el-upload__text" v-else>
                      <em>仅可预览图片</em>
                    </div>
                  </el-upload>
                  
                  <!-- 图片预览对话框 -->
                  <el-dialog v-model="previewDialogVisible" class="image-preview-dialog" :show-close="false">
                    <template #header="{ close }">
                      <div class="preview-header">
                        <button class="close-button" @click="close">
                          <el-icon><Close /></el-icon>
                        </button>
                      </div>
                    </template>
                    <img :src="previewImageUrl" class="preview-image" />
                  </el-dialog>
                </div>
              </el-card>
              
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
      
      <!-- 放弃编辑确认弹窗 -->
      <el-dialog
        v-model="cancelDialogVisible"
        title="确认放弃"
        width="30%"
        center
      >
        <span>确定要放弃编辑吗？未保存的内容将会丢失</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="goBack">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </main>
    
    <FooterComponent />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Close, ArrowRight, ArrowLeft, Check, Document, Lightning, Picture, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElSteps, ElStep } from 'element-plus'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import VideoBackground from '../components/VideoBackground.vue'
import store from '../store'

export default {
  name: 'SelectEdit',
  components: {
    HeaderComponent,
    FooterComponent,
    VideoBackground,
    Plus,
    Close,
    ArrowRight,
    ArrowLeft,
    Check,
    Document,
    Lightning,
    Picture,
    Edit,
    ElSteps,
    ElStep
  },
  setup() {
    const router = useRouter()
    const activeStep = ref(0)
    const dialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const previewImageUrl = ref('')
    const cancelDialogVisible = ref(false)
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 用户选择状态
    const selectedCarrier = ref('') // 载体选择
    const selectedFantasy = ref('') // 幻想类型选择
    
    // 计算载体标签显示内容
    const carrierTag = computed(() => {
      try {
        const carrier = selectedCarrier.value === '牛皮纸' ? 0 : 1;
        return {
          text: carrier === 0 ? '牛皮纸' : '永恒纸',
          type: carrier === 0 ? 'primary' : 'success'
        }
      } catch (e) {
        // 出现错误时返回默认值
        return {
          text: '牛皮纸',
          type: 'primary'
        }
      }
    })
    
    // 计算幻想类型标签显示内容
    const fantasyTag = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        return {
          text: fantasy === 0 ? '空想' : '联想',
          type: fantasy === 0 ? 'warning' : 'info'
        }
      } catch (e) {
        // 出现错误时返回默认值
        return {
          text: '空想',
          type: 'warning'
        }
      }
    })
    
    // 根据幻想类型判断是否显示图片上传功能
    const showImageUpload = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        // 空想(fantasy=0)不显示图片上传，联想(fantasy>1)显示图片上传
        return fantasy;
      } catch (e) {
        // 默认显示图片上传功能（联想）
        return true;
      }
    })
    
    // 根据幻想类型获取文本最大字数
    const maxTextLength = computed(() => {
      try {
        const fantasy = selectedFantasy.value === '空想' ? 0 : 1;
        // 空想(fantasy=0)最多4000字，联想(fantasy>1)最多8000字
        return fantasy === 0 ? 4000 : 8000;
      } catch (e) {
        // 默认为联想的字数限制
        return 8000;
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
    
    // 使用副本中的内容
    const content = computed({
      get: () => contentCopy.value,
      set: (newContent) => {
        contentCopy.value = { ...contentCopy.value, ...newContent }
      }
    })
    
    // 显示标题的计算属性（用于标题输入框）
    const displayTitle = computed({
      get: () => contentCopy.value.title,
      set: (title) => {
        contentCopy.value.title = title
      }
    })
    
    const fileList = ref([])
    
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
    
    // 文件上传处理函数
    const handleFileChange = (file, fileList) => {
      // 确保 fileList.value 存在
      if (!fileList.value || !Array.isArray(fileList.value)) {
        fileList.value = [];
      }
      
      // 检查文件是否为图片格式
      const isImage = file.raw.type.startsWith('image/');
      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        // 从文件列表中移除无效文件
        const index = fileList.value.findIndex(f => f.uid === file.uid);
        if (index !== -1) {
          fileList.value.splice(index, 1);
        }
        // 同时从副本中移除（通过索引匹配）
        if (index !== -1 && index < contentCopy.value.images.length) {
          contentCopy.value.images.splice(index, 1);
        }
        // 更新文件列表以刷新显示
        updateFileList();
        return;
      }
      
      // 检查文件大小（限制为10MB）
      const isLt10M = file.raw.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过 10MB!');
        // 从文件列表中移除过大的文件
        const index = fileList.value.findIndex(f => f.uid === file.uid);
        if (index !== -1) {
          fileList.value.splice(index, 1);
        }
        // 同时从副本中移除（通过索引匹配）
        if (index !== -1 && index < contentCopy.value.images.length) {
          contentCopy.value.images.splice(index, 1);
        }
        // 更新文件列表以刷新显示
        updateFileList();
        return;
      }
      
      // 检查图片数量限制（最多10张）
      if (fileList.length > 10) {
        ElMessage.error('最多只能上传10张图片!');
        // 从文件列表中移除超出限制的文件
        const index = fileList.value.findIndex(f => f.uid === file.uid);
        if (index !== -1) {
          fileList.value.splice(index, 1);
        }
        // 同时从副本中移除（通过索引匹配）
        if (index !== -1 && index < contentCopy.value.images.length) {
          contentCopy.value.images.splice(index, 1);
        }
        // 更新文件列表以刷新显示
        updateFileList();
        return;
      }
      
      // 创建 FileReader 实例
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // 添加到副本中
        contentCopy.value.images.push(e.target.result);
        // 更新文件列表以刷新显示
        updateFileList();
      };
      
      reader.readAsDataURL(file.raw);
    }
    
    const handleFileRemove = (file, fileList) => {
      // 确保 fileList.value 是一个数组
      if (!Array.isArray(fileList.value)) {
        fileList.value = [];
      }
      
      // 查找被删除文件的索引
      const index = fileList.value.findIndex(item => item && item.uid === file.uid);
      
      if (index > -1) {
        // 从内容副本中移除对应的图片
        contentCopy.value.images.splice(index, 1);
      } else {
        // 如果通过 uid 没有找到，尝试通过 URL 查找
        const imageUrl = file.url || (file.response && file.response?.url);
        if (imageUrl) {
          const imageIndex = contentCopy.value.images.indexOf(imageUrl);
          if (imageIndex > -1) {
            contentCopy.value.images.splice(imageIndex, 1);
          }
        }
      }
      
      // 更新文件列表以保持同步
      fileList.value = fileList;
    }
    
    // 更新文件列表的辅助函数
    const updateFileList = () => {
      fileList.value = contentCopy.value.images.map((image, index) => ({
        name: `image-${index}.png`,
        url: image
      }));
    }
    
    // 图片预览处理函数
    const handlePreview = (file) => {
      previewImageUrl.value = file.url || file.response?.url || '';
      previewDialogVisible.value = true;
    }
    
    // 保存内容
    const saveContent = () => {
      // 检查如果是联想类型(fantasy不为0)，则必须有图片
      const fantasy = contentCopy.value.fantasy;
      const images = contentCopy.value.images;
      
      if (fantasy !== 0 && images.length === 0) {
        ElMessage.error('联想类型的内容必须包含至少一张图片！');
        return;
      }
      
      // 使用contentCopy完全覆盖共享状态
      store.updateContent(contentCopy.value);
      
      // 设置ifEdit为1（因为是新内容）
      store.updateIfEdit(1);
      
      // 保存内容逻辑（现在由store自动处理本地存储）
      ElMessage.success('内容已保存!')
      router.push('/view')
    }
    
    // 放弃选择并返回首页
    const cancelSelection = () => {
      router.push('/')
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    // 显示放弃确认弹窗
    const showCancelDialog = () => {
      ElMessageBox.confirm(
        '确定要放弃编辑吗？未保存的内容将会丢失。',
        '确认放弃',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      .then(() => {
        // 用户确认放弃，返回上一页
        router.go(-1)
      })
      .catch(() => {
        // 用户取消操作，不执行任何操作
        ElMessage.info('已取消放弃操作')
      })
    }

    return {
      activeStep,
      selectedCarrier,
      selectedFantasy,
      content,
      displayTitle,
      fileList,
      handleFileChange,
      handleFileRemove,
      handlePreview,
      saveContent,
      nextStep,
      prevStep,
      cancelSelection,
      goBack,
      showCancelDialog,
      dialogVisible,
      previewDialogVisible,
      previewImageUrl,
      cancelDialogVisible,
      instructionsText,
      carrierTag,
      fantasyTag,
      showImageUpload,
      maxTextLength,
      disableImageActions
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

.content-card {
  margin-bottom: 25px;
  border-radius: 10px;
  border: 1px solid #e6e6e6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.content-card .card-header {
  justify-content: space-between;
}

.content-tags {
  display: flex;
  gap: 10px;
}

.content-tags .tag {
  margin: 0;
}

.editor-section {
  margin-bottom: 25px;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.input-label .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.title-editor {
  margin-bottom: 20px;
}

.text-editor {
  margin-bottom: 20px;
}

.image-upload-section {
  margin: 25px 0;
}

.image-uploader {
  width: 100%;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.dialog-footer {
  text-align: center;
}

.instructions {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.preview-header {
  position: relative;
  height: 0;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.close-button .el-icon {
  font-size: 20px;
  color: #666;
}

:deep(.el-radio__label) {
  width: 100%;
  padding-right: 30px;
}
</style>