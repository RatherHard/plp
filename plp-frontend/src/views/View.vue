<template>
  <div class="view-container">
    <HeaderComponent/>
    
    <VideoBackground />
    
    <main class="main-content">
      <div class="content-layout">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="content-card">
              <template #header>
                <div class="card-header">
                  <div class="header-content">
                    <h2 class="content-title">{{ store.getDisplayTitle() }}</h2>
                    <div class="content-meta" v-if="store.getSource() !== 0">
                      <span class="bottle-id">
                        <el-icon><Document /></el-icon>
                        ID: {{ content.id }}
                      </span>
                    </div>
                  </div>
                  <div class="content-tags">
                    <el-tag class="tag" :type="carrierTag.type">{{ carrierTag.text }}</el-tag>
                    <el-tag class="tag" :type="fantasyTag.type">{{ fantasyTag.text }}</el-tag>
                    <el-tag class="tag" :type="existTag.type">{{ existTag.text }}</el-tag>
                  </div>
                </div>
              </template>
              
              <div class="content-text">
                <p v-for="(paragraph, index) in content.text.split('\n')" :key="index">{{ paragraph }}</p>
              </div>
              
              <div class="content-images" v-if="showImages">
                <div v-if="images && images.length > 0" class="images-container">
                  <el-image
                    v-for="(image, index) in images"
                    :key="index"
                    :src="image"
                    class="content-image"
                    fit="cover"
                    :preview-src-list="images"
                    :initial-index="index"
                    :zoom-rate="1.2"
                    :preview-teleported="true"
                    scroll-container=".main-content"
                    @load="handleImageLoad(index)"
                    @error="handleImageError(index)"
                    @progress="handleImageProgress(index, $event)"
                    lazy
                  >
                    <template #placeholder>
                      <div class="image-loading">
                        <el-icon><Loading /></el-icon>
                        <span>加载中... {{ imageLoadStatus && imageLoadStatus[index] ? (imageLoadStatus[index].progress || 0) : 0 }}%</span>
                      </div>
                    </template>
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <span>图片加载失败</span>
                        <el-button @click="retryImageLoad(index)" size="small" type="primary">重试</el-button>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div v-else class="empty-content">
                  <el-icon><Picture /></el-icon>
                  <span>暂无图片</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="goToEdit" v-if="store.getSource() === 0 || carrierTag.text !== '永恒纸'">
          <el-icon><Edit /></el-icon>
          补充
        </el-button>
        <el-button type="success" @click="throwBottle">
          <el-icon><Position /></el-icon>
          扔出
        </el-button>
      </div>
      
      <!-- 回应区 -->
      <div class="comments-section">
        <el-card class="comments-card">
          <template #header>
            <div class="comments-header">
              <h3>
                <el-icon><ChatLineSquare /></el-icon>
                回应区
              </h3>
            </div>
          </template>
          
          <!-- 回应列表 -->
          <div class="comments-list">
            <div v-for="(comment, index) in comments" :key="index" class="comment-item">
              <div class="comment-content">
                <div class="comment-header" v-if="comment.id">
                  <span class="comment-id">
                    <el-icon><ChatLineSquare /></el-icon>
                    ID: {{ comment.id }}
                  </span>
                </div>
                <p>{{ comment.text }}</p>
                <div class="comment-meta">
                  <span class="comment-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatTime(comment.time) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="comments.length === 0" class="no-comments">
              <el-icon><ChatLineSquare /></el-icon>
              <span>暂无回应，快来发表第一条回应吧！</span>
            </div>
          </div>
          
          <!-- 发表回应 -->
          <div class="comment-form">
            <el-input
              type="textarea"
              v-model="newComment"
              placeholder="请输入您的回应..."
              :rows="3"
              maxlength="500"
              show-word-limit
            ></el-input>
            <div class="comment-actions">
              <el-button type="primary" @click="addComment" :disabled="!newComment.trim()">
                <el-icon><Promotion /></el-icon>
                发表回应
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </main>
    
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, 
  Picture, 
  Loading, 
  Edit, 
  Position, 
  ChatLineSquare, 
  Clock,
  Promotion
} from '@element-plus/icons-vue'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import store from '../store'
import { API_ENDPOINTS } from '../api'
import VideoBackground from '../components/VideoBackground.vue'
import { formatTime, getCarrierTag, getFantasyTag, getExistTag } from '../utils'


export default {
  name: 'View',
  components: {
    HeaderComponent,
    FooterComponent,
    VideoBackground,
    Document,
    Picture,
    Loading,
    Edit,
    Position,
    ChatLineSquare,
    Clock,
    Promotion
  },
  setup() {
    const router = useRouter()
    const dialogVisible = ref(false)
    const content = ref(store.getContent())
    const images = ref(content.value.images || [])
    const comments = ref([])
    const newComment = ref('')
    const imageLoadStatus = ref({})
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())
    
    // 计算载体标签显示内容
    const carrierTag = computed(() => {
      try {
        const carrier = content.value && content.value.carrier !== undefined ? content.value.carrier : 0;
        return getCarrierTag(carrier);
      } catch (e) {
        return getCarrierTag(0);
      }
    })
    
    // 计算幻想类型标签显示内容
    const fantasyTag = computed(() => {
      try {
        const fantasy = content.value && content.value.fantasy !== undefined ? content.value.fantasy : 0;
        return getFantasyTag(fantasy);
      } catch (e) {
        return getFantasyTag(0);
      }
    })
    
    // 计算存续时间标签显示内容
    const existTag = computed(() => {
      try {
        const exist = store.getExist();
        return getExistTag(exist);
      } catch (e) {
        return getExistTag(null);
      }
    })
    
    // 是否显示图片
    const showImages = computed(() => {
      try {
        const fantasy = content.value && content.value.fantasy !== undefined ? content.value.fantasy : 1;
        return fantasy !== 0;
      } catch (e) {
        return true;
      }
    })
    
    // 格式化时间显示
    const formatTimeDisplay = (time) => {
      return formatTime(time);
    }
    
    // 获取漂流瓶数据
    const fetchBottleData = async () => {
      try {
        // 如果是新创建的内容，不需要从服务器获取
        if (store.getFirstFetch() === 0) {
          return;
        }
        
        const response = await fetch(API_ENDPOINTS.records + '/' + store.getId());
        if (response.ok) {
          const data = await response.json();
          content.value = data;
          images.value = data.images || [];
        } else {
          ElMessage.error('获取漂流瓶内容失败');
        }
      } catch (error) {
        ElMessage.error('网络错误，获取漂流瓶内容失败');
      }
    }
    
    // 获取评论数据
    const fetchComments = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.comments + '/' + store.getId());
        if (response.ok) {
          const data = await response.json();
          comments.value = data;
        } else {
          ElMessage.error('获取评论失败');
        }
      } catch (error) {
        ElMessage.error('网络错误，获取评论失败');
      }
    }
    
    // 添加评论
    const addComment = async () => {
      if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容');
        return;
      }
      
      try {
        const response = await fetch(API_ENDPOINTS.comments, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bottleId: store.getId(),
            text: newComment.value
          })
        });
        
        if (response.ok) {
          ElMessage.success('评论发表成功');
          newComment.value = '';
          fetchComments(); // 重新获取评论
        } else {
          ElMessage.error('评论发表失败');
        }
      } catch (error) {
        ElMessage.error('网络错误，评论发表失败');
      }
    }
    
    // 扔出漂流瓶
    const throwBottle = async () => {
      try {
        // 检查是否为新内容
        if (store.getFirstFetch() === 0) {
          // 新内容，使用POST方法
          const response = await fetch(API_ENDPOINTS.records, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(content.value)
          });
          
          if (response.ok) {
            const data = await response.json();
            store.updateId(data.id);
            store.updateUploadTime(data.uploadTime);
            store.updateFirstFetch(1);
            store.updateIfEdit(0);
            ElMessage.success('漂流瓶扔出成功');
            router.push('/');
          } else {
            ElMessage.error('漂流瓶扔出失败');
          }
        } else {
          // 已存在的内容，检查是否被编辑
          if (store.getIfEdit() === 1) {
            // 内容被编辑，使用PUT方法
            const response = await fetch(API_ENDPOINTS.records + '/' + store.getId(), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(content.value)
            });
            
            if (response.ok) {
              store.updateIfEdit(0);
              ElMessage.success('漂流瓶更新成功');
              router.push('/');
            } else {
              ElMessage.error('漂流瓶更新失败');
            }
          } else {
            // 内容未被编辑，直接返回首页
            router.push('/');
          }
        }
      } catch (error) {
        ElMessage.error('网络错误，操作失败');
      }
    }
    
    // 前往编辑页面
    const goToEdit = () => {
      router.push('/edit');
    }
    
    // 图片加载处理
    const handleImageLoad = (index) => {
      // 图片加载成功处理
    }
    
    // 图片加载错误处理
    const handleImageError = (index) => {
      ElMessage.error(`图片加载失败`);
    }
    
    // 图片加载进度处理
    const handleImageProgress = (index, event) => {
      imageLoadStatus.value[index] = {
        progress: Math.round(event.percent)
      };
    }
    
    // 重试图片加载
    const retryImageLoad = (index) => {
      // 重试加载逻辑
    }
    
    // 初始化数据
    onMounted(() => {
      fetchBottleData();
      fetchComments();
    })
    
    return {
      content,
      images,
      comments,
      newComment,
      dialogVisible,
      instructionsText,
      carrierTag,
      fantasyTag,
      existTag,
      showImages,
      imageLoadStatus,
      formatTime: formatTimeDisplay,
      fetchBottleData,
      fetchComments,
      addComment,
      throwBottle,
      goToEdit,
      handleImageLoad,
      handleImageError,
      handleImageProgress,
      retryImageLoad
    }
  }
}
</script>

<style scoped>
.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  color: #666;
  font-size: 14px;
  flex-direction: column;
  gap: 8px;
}
  
.image-loading i {
  font-size: 20px;
}
  
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 14px;
  gap: 8px;
}
  
.image-error i {
  font-size: 24px;
}
  
.image-error button {
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 12px;
}
  
.view-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
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
  margin-bottom: 20px;
}

.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.content-title {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.content-meta {
  display: flex;
  align-items: center;
}

.bottle-id {
  display: inline-flex;
  align-items: center;
  background: #ecf5ff;
  color: #409eff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.bottle-id .el-icon {
  margin-right: 6px;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.content-tags .tag {
  margin: 0;
}

.content-text {
  padding: 20px 0;
}

.content-text p {
  margin-bottom: 15px;
  line-height: 1.8;
  color: #555;
  font-size: 16px;
  white-space: pre-wrap;
}

.content-images {
  margin-top: 20px;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.content-image {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  aspect-ratio: 1/1;
}

.content-image :deep(.el-image__inner) {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.content-image :deep(.el-image__inner):hover {
  transform: scale(1.05);
}

.content-image :deep(.el-image__placeholder) {
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.image-loading .el-icon {
  font-size: 20px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #f56c6c;
  font-size: 14px;
  gap: 8px;
  padding: 10px;
  text-align: center;
}

.image-error .el-icon {
  font-size: 24px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.empty-content .el-icon {
  font-size: 36px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 30px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.action-buttons :deep(.el-button) {
  font-size: 16px;
  padding: 15px 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-section {
  max-width: 1200px;
  margin: 0 auto 30px;
}

.comments-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.comments-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-header .el-icon {
  font-size: 20px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content p {
  margin: 0 0 10px 0;
  color: #555;
  line-height: 1.6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-id {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  font-weight: bold;
}

.comment-id .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

.comment-meta {
  text-align: right;
}

.comment-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 12px;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 40px 0;
  font-style: italic;
  gap: 10px;
}

.no-comments .el-icon {
  font-size: 24px;
}

.comment-form {
  margin-top: 20px;
}

.comment-actions {
  margin-top: 15px;
  text-align: right;
}

.comment-actions :deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 禁用图片预览时的拖拽功能 */
:deep(.el-image-viewer__img) {
  pointer-events: none;
}

/* 隐藏图片预览界面的放大和缩小按钮 */
:deep(.el-image-viewer__actions) {
  display: none;
}

/* 禁用图片预览时的鼠标滚轮控制滚动条 */
:deep(.el-image-viewer__wrapper) {
  overscroll-behavior: none;
}

@media (max-width: 768px) {
  .content-image {
    width: calc(50% - 10px);
  }

  .images-container {
    justify-content: center;
  }
  
  .el-col {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
  }
  
  .action-buttons :deep(.el-button) {
    width: 80%;
    padding: 15px 25px;
    font-size: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .content-title {
    font-size: 20px;
  }
}
</style>