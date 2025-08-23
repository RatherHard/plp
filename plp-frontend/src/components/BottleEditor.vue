<template>
  <div class="bottle-editor">
    <slot name="header"></slot>
    
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <slot name="card-header">
            <el-icon><Edit /></el-icon>
            <span>内容编辑</span>
            <div class="content-tags" v-if="showTags">
              <el-tag class="tag" :type="carrierTag.type">{{ carrierTag.text }}</el-tag>
              <el-tag class="tag" :type="fantasyTag.type">{{ fantasyTag.text }}</el-tag>
            </div>
          </slot>
        </div>
      </template>
      
      <div class="content-text">
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
      
      <slot name="actions">
        <div class="editor-actions">
          <el-button type="primary" @click="saveContent">
            <el-icon><Check /></el-icon>
            保存
          </el-button>
          <el-button type="danger" @click="showCancelDialog">
            <el-icon><Close /></el-icon>
            放弃
          </el-button>
        </div>
      </slot>
    </el-card>
    
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
          <el-button type="danger" @click="cancelEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Plus, Close, Document, Picture, Edit, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'BottleEditor',
  components: {
    Plus,
    Close,
    Document,
    Picture,
    Edit,
    Check
  },
  props: {
    // 内容对象
    modelValue: {
      type: Object,
      required: true
    },
    // 是否显示图片上传区域
    showImageUpload: {
      type: [Boolean, Number],
      default: true
    },
    // 最大文本长度
    maxTextLength: {
      type: Number,
      default: 8000
    },
    // 是否禁用图片操作
    disableImageActions: {
      type: Boolean,
      default: false
    },
    // 载体标签信息
    carrierTag: {
      type: Object,
      default: () => ({
        text: '牛皮纸',
        type: 'primary'
      })
    },
    // 幻想类型标签信息
    fantasyTag: {
      type: Object,
      default: () => ({
        text: '联想',
        type: 'info'
      })
    },
    // 是否显示标签
    showTags: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'save', 'cancel'],
  setup(props, { emit }) {
    const previewDialogVisible = ref(false)
    const previewImageUrl = ref('')
    const cancelDialogVisible = ref(false)
    
    // 内容计算属性
    const content = computed({
      get: () => props.modelValue,
      set: (newContent) => {
        emit('update:modelValue', newContent)
      }
    })
    
    // 显示标题的计算属性（用于标题输入框）
    const displayTitle = computed({
      get: () => content.value.title,
      set: (title) => {
        content.value.title = title
      }
    })
    
    const fileList = ref([])
    
    // 初始化文件列表
    const initFileList = () => {
      const images = content.value.images
      if (images && images.length > 0) {
        fileList.value = images.map((image, index) => ({
          name: `image-${index}.png`,
          url: image
        }))
      } else {
        fileList.value = []
      }
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
        // 同时从内容中移除（通过索引匹配）
        if (index !== -1 && index < content.value.images.length) {
          content.value.images.splice(index, 1);
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
        // 同时从内容中移除（通过索引匹配）
        if (index !== -1 && index < content.value.images.length) {
          content.value.images.splice(index, 1);
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
        // 同时从内容中移除（通过索引匹配）
        if (index !== -1 && index < content.value.images.length) {
          content.value.images.splice(index, 1);
        }
        // 更新文件列表以刷新显示
        updateFileList();
        return;
      }
      
      // 创建 FileReader 实例
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // 添加到内容中
        content.value.images.push(e.target.result);
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
        // 从内容中移除对应的图片
        content.value.images.splice(index, 1);
      } else {
        // 如果通过 uid 没有找到，尝试通过 URL 查找
        const imageUrl = file.url || (file.response && file.response.url);
        if (imageUrl) {
          const imageIndex = content.value.images.indexOf(imageUrl);
          if (imageIndex > -1) {
            content.value.images.splice(imageIndex, 1);
          }
        }
      }
      
      // 更新文件列表以保持同步
      fileList.value = fileList;
    }
    
    // 更新文件列表的辅助函数
    const updateFileList = () => {
      fileList.value = content.value.images.map((image, index) => ({
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
      const fantasy = content.value && content.value.fantasy !== undefined ? content.value.fantasy : 1;
      const images = content.value && content.value.images ? content.value.images : [];
      
      if (props.showImageUpload && fantasy !== 0 && images.length === 0) {
        ElMessage.error('联想类型的内容必须包含至少一张图片！');
        return;
      }
      
      emit('save', content.value);
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
        // 用户确认放弃
        cancelDialogVisible.value = true;
        cancelEdit();
      })
      .catch(() => {
        // 用户取消操作
        ElMessage.info('已取消放弃操作');
      })
    }
    
    // 取消编辑
    const cancelEdit = () => {
      emit('cancel');
    }
    
    return {
      content,
      displayTitle,
      fileList,
      previewDialogVisible,
      previewImageUrl,
      cancelDialogVisible,
      initFileList,
      handleFileChange,
      handleFileRemove,
      updateFileList,
      handlePreview,
      saveContent,
      showCancelDialog,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.content-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.content-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.7);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.content-tags {
  display: flex;
  gap: 10px;
}

.content-tags .tag {
  margin-right: 0;
}

.content-text {
  padding: 20px;
}

.content-text h2 {
  margin-bottom: 20px;
  color: #333;
}

.editor-section {
  margin-bottom: 25px;
}

.input-label {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-editor {
  margin-bottom: 20px;
}

.image-upload-section {
  margin: 15px 0 30px;
  padding: 0 20px;
}

.image-uploader {
  width: 100%;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
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

.preview-header {
  display: flex;
  justify-content: flex-end;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.preview-image {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
</style>