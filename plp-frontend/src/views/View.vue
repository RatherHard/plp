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
    const newComment = ref('')
    const comments = ref([])
    const imageLoadStatus = ref({})  // 图片加载状态
    
    // 使用共享状态中的内容
    const content = computed(() => store.getContent())
    
    const images = computed(() => {
      const imgs = content.value.images
      // 确保返回的是数组，即使为空也返回空数组
      return Array.isArray(imgs) ? imgs : []
    })
    
    // 判断是否应该显示图片区域（fantasy不为0时显示）
    const showImages = computed(() => {
      const bottleContent = store.getContent()
      const fantasy = bottleContent && bottleContent.fantasy !== undefined ? bottleContent.fantasy : 1
      return fantasy !== 0
    })
    
    // 初始化图片加载状态
    const initImageLoadStatus = (imageCount) => {
      const status = {}
      for (let i = 0; i < imageCount; i++) {
        status[i] = {
          loaded: false,
          error: false,
          progress: 0,
          retryCount: 0,
          src: null
        }
      }
      return status
    }
    
    
    // 监听images变化，初始化加载状态
    watch(images, (newImages) => {
      imageLoadStatus.value = initImageLoadStatus(newImages.length)
    }, { immediate: true })
    
    // 在组件挂载时初始化加载状态
    onMounted(() => {
      if (images.value.length > 0) {
        imageLoadStatus.value = initImageLoadStatus(images.value.length)
      }
    })
    
    // 获取网站说明文本
    const instructionsText = computed(() => store.getInstructionsText())

    // 检查视频文件是否存在，如果不存在则使用默认颜色背景
    // 根据存储的参数计算显示标签
    const carrierTag = computed(() => {
      // 从共享状态获取载体信息，如果不存在则默认为平凡纸(0)
      const bottleContent = store.getContent()
      const carrier = bottleContent && bottleContent.carrier !== undefined ? bottleContent.carrier : 0
      
      // 根据载体代码返回显示文本和标签类型
      return {
        text: carrier === 0 ? '牛皮纸' : '永恒纸',
        type: carrier === 0 ? 'primary' : 'success'
      }
    })
    
    const fantasyTag = computed(() => {
      // 从共享状态获取幻想类型信息，如果不存在则默认为联想(1)
      const bottleContent = store.getContent()
      const fantasy = bottleContent && bottleContent.fantasy !== undefined ? bottleContent.fantasy : 1
      
      // 根据幻想类型代码返回显示文本和标签类型
      return {
        text: fantasy === 0 ? '空想' : '联想',
        type: fantasy === 0 ? 'warning' : 'info'
      }
    })
    
    // 根据存续时间计算漂流瓶状态标签
    const existTag = computed(() => {
      // 从store获取存续时间
      const exist = store.getExist()
      
      // 如果没有存续时间信息，显示默认标签
      if (exist === null || exist === undefined) {
        return {
          text: '无瑕的漂流瓶',
          type: 'primary'
        }
      }
      
      // 根据存续时间返回对应的标签文本和类型
      if (exist <= 7) {
        return {
          text: '无瑕的漂流瓶',
          type: 'primary'
        }
      } else if (exist <= 30) {
        return {
          text: '完整的漂流瓶',
          type: 'success'
        }
      } else if (exist <= 90) {
        return {
          text: '微瑕的漂流瓶',
          type: 'warning'
        }
      } else if (exist <= 365) {
        return {
          text: '受损的漂流瓶',
          type: 'danger'
        }
      } else {
        return {
          text: '破旧的漂流瓶',
          type: 'info'
        }
      }
    })
    
    // 图片加载处理函数
    const handleImageLoad = (e) => {
      console.log('图片加载成功')
    }
    
    const handleImageError = (e) => {
      console.error('图片加载失败:', e)
    }
    
    // 图片加载进度处理
    const handleImageProgress = (index) => (event) => {
      if (event.lengthComputable && imageLoadStatus.value) {
        const progress = Math.round((event.loaded / event.total) * 100)
        if (!imageLoadStatus.value[index]) {
          // 确保索引存在
          imageLoadStatus.value[index] = {
            loaded: false,
            error: false,
            progress: 0,
            retryCount: 0,
            src: null
          }
        }
        imageLoadStatus.value[index] = {
          ...imageLoadStatus.value[index],
          progress: progress
        }
      }
    }
    
    // 重试加载图片
    const retryImageLoad = (index) => {
      if (!imageLoadStatus.value[index]) return
      
      const maxRetries = 3
      let currentStatus = imageLoadStatus.value[index]
      
      if (currentStatus.retryCount >= maxRetries) {
        ElMessage.warning(`已达到最大重试次数(${maxRetries})`)
        return
      }
      
      // 重置状态
      currentStatus = {
        ...currentStatus,
        loaded: false,
        error: false,
        progress: 0,
        retryCount: currentStatus.retryCount + 1
      }
      
      // 强制刷新图片
      const img = new Image()
      img.src = currentStatus.src + (currentStatus.src.includes('?') ? '&' : '?') + 't=' + Date.now()
      
      // 重置状态
      imageLoadStatus.value = {
        ...imageLoadStatus.value
      }
    }
    
    const goToEdit = () => {
      router.push('/edit')
    }
    
    // 修改扔出按钮功能，添加确认弹窗
    const throwBottle = () => {
      ElMessageBox.confirm(
        '确定要扔出这个漂流瓶吗？扔出后将无法再编辑。',
        '确认扔出',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      .then(async () => {
        // 检查ifEdit状态，决定是否真正发送数据到服务器
        const ifEdit = store.getIfEdit();
        
        // 获取source状态
        const source = store.getSource();
        
        // 如果ifEdit为0，则假装成功投出但不向服务器发送数据
        if (ifEdit === 0) {
          // 检查source是否为0，如果是则拒绝假装扔出
          if (source === 0) {
          ElMessageBox.alert(
            '请先编辑内容！！！！！',
            '操作拒绝',
            { 
              confirmButtonText: '确定',
              type: 'warning'
            }
          );
        return;
      }
          console.log('内容未编辑，假装成功投出');
          
          // 显示成功弹窗
          ElMessageBox.alert('漂流瓶将飘向下一个人~', '扔出成功', {
            confirmButtonText: '确定',
            type: 'success',
            showClose: false  // 禁用右上角关闭按钮，确保用户必须点击确定按钮
          }).then(() => {
            // 弹窗确认后清除本地数据
            store.clearLocalStorage(); // 使用新的方法彻底清除本地存储
              
            // 明确重置共享状态为默认值
            store.clearAll();
              
            // 重置ifEdit状态
            store.updateIfEdit(0);
              
            // 清除密钥
            store.clearKey();
              
            // 返回主页
            router.push('/')
          })
          return;
        }
        
        // 当source为1时不获取上传密钥
        let uploadKey = null;
        if (source !== 1) {
          // 获取上传密钥
          try {
            const keyResponse = await fetch(API_ENDPOINTS.getKey);
            if (keyResponse.ok) {
              const keyData = await keyResponse.json();
              uploadKey = keyData.key;
              // 保存密钥到共享状态
              store.updateKey(uploadKey);
            } else {
              // 获取密钥失败，显示服务器返回的错误信息
              const errorText = await keyResponse.text();
              ElMessageBox.alert(`获取上传密钥失败: ${errorText}`, '获取密钥失败', {
                confirmButtonText: '确定',
                type: 'error',
              });
              return;
            }
          } catch (error) {
            console.error('获取上传密钥时出错:', error);
            ElMessageBox.alert('网络错误，无法获取上传密钥', '获取密钥失败', {
              confirmButtonText: '确定',
              type: 'error',
            });
            return;
          }
        }
        
        // 用户确认扔出，将数据传输到服务器
        const content = store.getContent();
        
        // 创建FormData对象用于multipart/form-data上传
        const formData = new FormData();
        const formData_ = new FormData();
        
        // 添加文本内容到FormData
        formData.append('text', content.text);
        formData_.append('text', content.text);
        
        // 添加标题到FormData
        formData.append('title', content.title || '');
        formData_.append('title', content.title || '');
        
        // 添加密钥到FormData（仅当source不为1时）
        if (source !== 1) {
          formData.append('key', uploadKey);
        }
        
        // 添加载体类型到FormData
        // 从localStorage获取载体信息，如果不存在则默认为牛皮纸(0)
        const bottleData = localStorage.getItem('bottleContent');
        let carrier = 0;
        if (bottleData) {
          try {
            const parsed = JSON.parse(bottleData);
            carrier = parsed.carrier !== undefined ? parsed.carrier : 0;
          } catch (e) {
            console.error('解析载体信息失败:', e);
          }
        }
        formData.append('carrier', carrier);
        
        // 添加所有图片到FormData（支持0张或多张）
        if (content.images && content.images.length > 0) {
          content.images.forEach((image, index) => {
            // 检查是否为Base64数据
            if (image.startsWith('data:')) {
              // 将Base64图片转换为Blob对象
              const base64toBlob = (base64Data, contentType = '', sliceSize = 512) => {
                const byteCharacters = atob(base64Data.split(',')[1]);
                const byteArrays = [];
                
                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                  const slice = byteCharacters.slice(offset, offset + sliceSize);
                  
                  const byteNumbers = new Array(slice.length);
                  for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                  }
                  
                  const byteArray = new Uint8Array(byteNumbers);
                  byteArrays.push(byteArray);
                }
                
                const blob = new Blob(byteArrays, { type: contentType });
                return blob;
              };
              
              // 提取Base64数据中的MIME类型
              let mimeType = 'image/png';
              const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/);
              if (mimeMatch && mimeMatch[1]) {
                mimeType = mimeMatch[1];
              }
              
              // 将Base64转换为Blob
              const imageBlob = base64toBlob(image, mimeType);
              
              // 添加到FormData
              formData.append('images', imageBlob, `bottle-image-${index}.png`);
              formData_.append('images', imageBlob, `bottle-image-${index}.png`);
            } else {
              // 如果不是Base64数据，可能需要其他处理方式
              // 这里假设是URL或其他格式，可能需要根据实际情况调整
              console.warn('图片不是Base64格式，可能需要特殊处理');
            }
          });
        }
        
        // 发送POST请求到服务器
        // 根据source和ifEdit状态决定使用哪个API端点
        const if_Edit = store.getIfEdit();
        const id = store.getId();
        
        let uploadUrl = API_ENDPOINTS.upload;
        let method = 'POST'; // 默认使用POST方法
        let formData__ = formData;
        if (source === 1 && if_Edit === 1) {
          // 如果source为1且ifEdit为1，则使用record端点和PUT方法
          uploadUrl = `${API_ENDPOINTS.records}/${id}`;
          method = 'PUT'; // 使用PUT方法更新记录
          formData__ = formData_;
        }
        
        fetch(uploadUrl, {
          method: method,
          body: formData__
        })
        .then(response => {
          if (response.ok) {
            console.log('漂流瓶数据已成功传输到服务器');
            
            // 显示成功弹窗
            ElMessageBox.alert('漂流瓶已成功扔出！', '扔出成功', {
              confirmButtonText: '确定',
              type: 'success',
            }).then(() => {
              // 弹窗确认后清除本地数据
              store.clearLocalStorage(); // 使用新的方法彻底清除本地存储
              
              // 明确重置共享状态为默认值
              store.clearAll();
              
              // 重置ifEdit状态
              store.updateIfEdit(0);
              
              // 清除密钥
              store.clearKey();
              
              // 返回主页
              router.push('/')
            })
          } else {
            console.error('服务器返回错误:', response.status);
            // 显示失败弹窗并停留在本页面
            ElMessageBox.alert('数据传输失败，请稍后重试', '扔出失败', {
              confirmButtonText: '确定',
              type: 'error',
            })
          }
        })
        .catch(error => {
          console.error('传输数据到服务器时出错:', error);
          // 显示失败弹窗并停留在本页面
          ElMessageBox.alert('网络错误，数据传输失败', '扔出失败', {
            confirmButtonText: '确定',
            type: 'error',
          })
        });
      })
      .catch(() => {
        // 用户取消操作
        ElMessage.info('已取消扔出操作')
      })
    }

    // 从服务器获取随机内容
    const fetchRandomContent = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getRandom)
        if (response.ok) {
          const data = await response.json()
          
          // 更新ID
          if (data.id) {
            store.updateId(data.id)
          }
          
          // 更新共享状态
          if (data.text) {
            store.updateText(data.text)
          }
          
          // 特别处理图片数据
          if (data.images && Array.isArray(data.images)) {
            // 确保图片URL是有效的
            const validImages = data.images.filter(image => {
              // 简单验证图片URL是否有效
              return typeof image === 'string' && image.length > 0
            })
            store.updateImages(validImages)
          } else if (data.filenames && Array.isArray(data.filenames)) {
            // 如果有filenames数组，则为每个文件名构建图片URL
            const imageUrls = data.filenames.map(filename => 
              `${API_ENDPOINTS.uploads}${filename}`
            )
            store.updateImages(imageUrls)
          } else if (data.filename) {
            // 如果有filename字段，则构建图片URL
            const imageUrl = `${API_ENDPOINTS.uploads}${data.filename}`
            store.updateImages([imageUrl])
          } else {
            // 如果没有图片数据，确保清空图片列表
            store.updateImages([])
          }
          
          // 更新上传时间
          if (data.uploadTime) {
            store.updateUploadTime(data.uploadTime)
            
            // 计算帖子存续时间
            // 获取上传时间的前10个字符（格式为XXXX-XX-XX表示年-月-日）
            const uploadDateStr = data.uploadTime.substring(0, 10)
            const uploadDate = new Date(uploadDateStr)
            const currentDate = new Date()
            
            // 计算两个日期之间的天数差
            const timeDiff = currentDate.getTime() - uploadDate.getTime()
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
            
            // 更新存续时间到共享状态
            store.updateExist(daysDiff)
          }
          
          // 更新标题
          if (data.title) {
            store.updateTitle(data.title)
          }
          
          // 更新幻想类型(fantasy)
          if (data.fantasy !== undefined && data.fantasy !== null) {
            store.updateFantasy(data.fantasy)
          } else {
            // 如果服务器未返回fantasy字段，则默认为联想（1）
            store.updateFantasy(1)
          }
          
          // 更新载体类型(carrier)
          if (data.carrier !== undefined && data.carrier !== null) {
            store.updateCarrier(data.carrier)
          } else {
            // 如果服务器未返回carrier字段，则默认为牛皮纸（0）
            store.updateCarrier(0)
          }
          
          // 设置来源为来自他人
          store.updateSource(1)
          
          ElMessage.success('内容加载成功')
        } else {
          console.error('获取服务器数据失败:', response.status)
          ElMessage.error('获取内容失败')
          // 设置默认幻想类型为联想
          store.updateFantasy(1)
          // 确保清空图片列表
          store.updateImages([])
        }
      } catch (error) {
        console.error('获取服务器数据时出错:', error)
        ElMessage.error('网络错误，获取内容失败')
        // 设置默认幻想类型为联想
        store.updateFantasy(1)
        // 确保清空图片列表
        store.updateImages([])
      } finally {
        // 获取数据后将firstFetch设置为0
        store.updateFirstFetch(0)
      }
    }

    // 从服务器获取评论
    const fetchComments = async () => {
      // 获取共享状态中的ID
      const id = store.getId()
      
      // 检查ID是否存在
      if (!id) {
        ElMessage.error('无法获取评论：缺少内容ID')
        return
      }
      
      try {
        // 向服务器发送请求获取评论
        const response = await fetch(`${API_ENDPOINTS.records}/${id}/comments`)
        
        if (response.ok) {
          const data = await response.json()
          
          // 检查返回的数据是否为数组
          if (Array.isArray(data)) {
            // 更新评论列表，包含评论ID
            comments.value = data.map(comment => ({
              id: comment.id,
              text: comment.content,
              time: comment.commentTime || new Date().toLocaleString('zh-CN')
            }))
          } else {
            console.warn('服务器返回的评论数据格式不正确')
            comments.value = []
          }
        } else {
          console.error('获取评论失败:', response.status)
          ElMessage.error('获取评论失败')
          comments.value = []
        }
      } catch (error) {
        console.error('获取评论时出错:', error)
        ElMessage.error('网络错误，获取评论失败')
        comments.value = []
      }
    }

    // 添加 onMounted 钩子
    onMounted(() => {
      // 检查firstFetch状态，当且仅当firstFetch为1时才从服务器获取数据
      if (store.getFirstFetch() === 1) {
        fetchRandomContent().then(() => {
          // 内容加载成功后获取评论
          fetchComments()
        })
      }
    })
    
    // 添加评论
    const addComment = async () => {
      if (newComment.value.trim()) {
        // 获取共享状态中的ID
        const id = store.getId();
        
        // 检查ID是否存在
        if (!id) {
          ElMessage.error('无法发表评论：缺少内容ID');
          return;
        }
        
        try {
          // 向服务器发送评论
          const response = await fetch(`${API_ENDPOINTS.records}/${id}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: newComment.value
            })
          });
          
          if (response.ok) {
            newComment.value = '';
            ElMessage.success('评论发表成功，正在等待审核！');
          } else {
            console.error('服务器返回错误:', response.status);
            ElMessage.error('评论发表失败，请稍后重试');
          }
        } catch (error) {
          console.error('发表评论时出错:', error);
          ElMessage.error('网络错误，评论发表失败');
        }
      }
    };

    // 格式化时间显示
    const formatTime = (timeString) => {
      if (!timeString) return '未知时间';
      
      const date = new Date(timeString);
      const now = new Date();
      const diff = now - date;
      
      // 计算时间差
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (seconds < 60) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 30) {
        return `${days}天前`;
      } else {
        // 超过30天显示具体日期
        return date.toLocaleDateString('zh-CN');
      }
    };

    return {
      content,
      images,
      store,
      handleImageLoad,
      handleImageError,
      handleImageProgress,
      retryImageLoad,
      goToEdit,
      throwBottle,
      dialogVisible,
      instructionsText,
      carrierTag,
      fantasyTag,
      existTag,
      imageLoadStatus,
      showImages, // 添加 showImages 属性
      // 评论功能相关
      newComment,
      comments,
      addComment,
      // 时间格式化函数
      formatTime
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
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.comment-time .el-icon {
  margin-right: 4px;
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