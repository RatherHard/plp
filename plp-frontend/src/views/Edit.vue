<template>
  <div class="view-container">
    <HeaderComponent @show-instructions="showInstructions" />
    
    <div class="video-background">
      <video 
        v-if="videoSource"
        class="background-video" 
        :src="videoSource" 
        autoplay 
        loop 
        muted
      ></video>
      <div v-else class="fallback-background"></div>
    </div>
    
    <main class="main-content">
      <div class="content-layout">
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="content-display">
              <div class="content-text">
                <div class="content-tags">
                  <el-tag class="tag" :type="carrierTag.type">{{ carrierTag.text }}</el-tag>
                  <el-tag class="tag" :type="fantasyTag.type">{{ fantasyTag.text }}</el-tag>
                </div>
                
                <div class="editor-section">
                  <div class="input-label">标题</div>
                  <el-input
                    v-model="displayTitle"
                    placeholder="请输入标题（不超过20字）"
                    class="title-editor"
                    maxlength="20"
                    show-word-limit
                  />
                </div>
                
                <div class="editor-section">
                  <div class="input-label">正文</div>
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
              </div>
              
              <div class="image-upload-section" v-if="showImageUpload">
                <h3>上传图片</h3>
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
              
              <div class="editor-actions">
                <el-button type="primary" @click="saveContent">保存</el-button>
                <el-button type="danger" @click="showCancelDialog">放弃</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
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
import { Plus, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import store from '../store'

export default {
  name: 'Edit',
  components: {
    HeaderComponent,
    FooterComponent,
    Plus
  },
  setup() {
    const router = useRouter()
    const dialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const previewImageUrl = ref('')
    const cancelDialogVisible = ref(false)
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 计算载体标签显示内容
    const carrierTag = computed(() => {
      try {
        const content = store.getContent();
        const carrier = content && content.carrier !== undefined ? content.carrier : 0;
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
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
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
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
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
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
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
    
    // 保存原始内容用于比较
    const originalContent = JSON.parse(JSON.stringify(store.getContent()))
    
    // 创建内容副本用于编辑
    const contentCopy = ref(JSON.parse(JSON.stringify(store.getContent())))
    
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
    const videoSource = ref('')
    
    // 初始化文件列表
    onMounted(() => {
      // 检查是否为永恒纸（carrier=1）且来源为编辑（source=1）
      const content = store.getContent();
      const carrier = content && content.carrier !== undefined ? content.carrier : 0;
      const source = store.getSource();
      
      if (carrier === 1 && source === 1) {
        // 清空所有数据和共享状态
        store.clearAll();
        
        // 弹出警告
        ElMessageBox.alert(
          '不可修改永恒纸上的内容',
          '警告',
          {
            confirmButtonText: '确定',
            type: 'warning',
            callback: () => {
              // 回退到首页
              router.push('/');
            }
          }
        );
        return;
      }
      
      // 从副本初始化图片列表
      const images = contentCopy.value.images
      if (images && images.length > 0) {
        fileList.value = images.map((image, index) => ({
          name: `image-${index}.png`,
          url: image
        }))
      } else {
        fileList.value = []
      }
      
      try {
        fetch('/videos/Mai.mp4')
          .then(response => {
            if (response.ok) {
              videoSource.value = '/videos/Mai.mp4'
            }
          })
          .catch(() => {
            videoSource.value = ''
          })
      } catch (e) {
        videoSource.value = ''
      }
    })
    
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
        const imageUrl = file.url || (file.response && file.response.url);
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
    
    // 添加图片错误处理函数，与View.vue保持一致
    const handleImageError = (index) => {
      ElMessage.error(`图片加载失败`)
    }
    
    const saveContent = () => {
      // 检查如果是联想类型(fantasy不为0)，则必须有图片
      const fantasy = contentCopy.value && contentCopy.value.fantasy !== undefined ? contentCopy.value.fantasy : 1;
      const images = contentCopy.value && contentCopy.value.images ? contentCopy.value.images : [];
      
      if (fantasy !== 0 && images.length === 0) {
        ElMessage.error('联想类型的内容必须包含至少一张图片！');
        return;
      }
      
      // 使用contentCopy完全覆盖共享状态
      store.updateContent(contentCopy.value);
      
      // 检查内容是否被修改（标题、正文或图片）
      const isTitleChanged = originalContent.title !== contentCopy.value.title;
      const isTextChanged = originalContent.text !== contentCopy.value.text;
      const isImagesChanged = JSON.stringify(originalContent.images) !== JSON.stringify(contentCopy.value.images);
      
      // 根据内容是否被修改来设置ifEdit状态
      if (isTitleChanged || isTextChanged || isImagesChanged) {
        // 内容被修改，设置ifEdit为1
        store.updateIfEdit(1);
      } else {
        // 内容未被修改，设置ifEdit为0
        store.updateIfEdit(0);
      }
      
      // 保存内容逻辑（现在由store自动处理本地存储）
      ElMessage.success('内容已保存!')
      router.push('/view')
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
    
    // 显示网站说明弹窗
    const showInstructions = () => {
      dialogVisible.value = true
    }
    
    return {
      content,
      displayTitle,
      fileList,
      videoSource,
      handleFileChange,
      handleFileRemove,
      handlePreview,
      handleImageError,
      saveContent,
      goBack,
      showCancelDialog,
      dialogVisible,
      previewDialogVisible,
      previewImageUrl,
      cancelDialogVisible,
      showInstructions,
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
.view-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

@keyframes gradientAnimation {
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

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
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
  opacity: 0.8;
}

.fallback-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  position: relative;
  height: calc(100vh - 100px);
  padding: 80px 20px 50px;
  overflow-y: auto;
  top: 51px;
}

.content-layout {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.content-text h2 {
  margin-bottom: 20px;
  color: #333;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: bold;
  padding: 15px;
  text-align: center;
}

.content-tags {
  margin-bottom: 20px;
}

.content-tags .tag {
  margin-right: 10px;
}

.editor-section {
  margin-bottom: 20px;
}

.text-editor {
  margin-bottom: 20px;
}

.image-upload-section {
  margin: 15px 0;
}

.image-uploader {
  width: 100%;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 50px;
}

.editor-actions :deep(.el-button) {
  font-size: 18px;
  padding: 20px 40px;
  border-radius: 10px;
}

.editor-actions .el-button:first-child {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

.editor-actions .el-button:last-child {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.dialog-footer {
  text-align: center;
}

.instructions {
  line-height: 1.6;
  color: #333;
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

.input-label {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.title-editor {
  margin-bottom: 20px;
}

.content-text .title-editor :deep(.el-input__inner) {
  font-size: 14px;
  padding: 12px;
  text-align: left;
}
</style>
