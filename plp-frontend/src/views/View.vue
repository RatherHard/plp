<template>
  <div class="view-container">
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
      <div class="content-layout">
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="content-display">
              <div class="content-text">
                <h2>{{ store.getDisplayTitle() }}</h2>
                <div class="content-meta" v-if="store.getSource() !== 0">
                  <span class="bottle-id">ID: {{ content.id }}</span>
                </div>
                <div class="content-tags">
                  <el-tag class="tag" :type="carrierTag.type">{{ carrierTag.text }}</el-tag>
                  <el-tag class="tag" :type="fantasyTag.type">{{ fantasyTag.text }}</el-tag>
                  <el-tag class="tag" :type="existTag.type">{{ existTag.text }}</el-tag>
                </div>
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
                        <i class="el-icon-loading"></i> 加载中... {{ imageLoadStatus && imageLoadStatus[index] ? (imageLoadStatus[index].progress || 0) : 0 }}%
                      </div>
                    </template>
                    <template #error>
                      <div class="image-error">
                        <i class="el-icon-picture-outline-round"></i>
                        图片加载失败
                        <el-button @click="retryImageLoad(index)" size="small">重试</el-button>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div v-else class="empty-content">暂无图片</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="goToEdit" v-if="store.getSource() === 0 || carrierTag.text !== '永恒纸'">补充</el-button>
        <el-button type="success" @click="throwBottle">扔出</el-button>
        <el-button type="info" @click="toggleComments" v-if="store.getSource() !== 0">回应</el-button>
      </div>
      
      <!-- 回应区 -->
      <div class="comments-section" v-if="showComments">
        <div class="comments-header">
          <h3>回应区</h3>
        </div>
        
        <!-- 回应列表 -->
        <div class="comments-list">
          <div v-for="(comment, index) in comments" :key="index" class="comment-item">
            <div class="comment-content">
              <div class="comment-header" v-if="comment.id">
                <span class="comment-id">ID: {{ comment.id }}</span>
              </div>
              <p>{{ comment.text }}</p>
              <div class="comment-meta">
                <span class="comment-time">{{ comment.time }}</span>
              </div>
            </div>
          </div>
          <div v-if="comments.length === 0" class="no-comments">
            暂无回应，快来发表第一条回应吧！
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
            <el-button type="primary" @click="addComment" :disabled="!newComment.trim()">发表回应</el-button>
          </div>
        </div>
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
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import store from '../store'
import { API_ENDPOINTS } from '../api'

export default {
  name: 'View',
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const router = useRouter()
    const dialogVisible = ref(false)
    const showComments = ref(false)
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
    const videoSource = ref('')
    try {
      fetch('/videos/Mai.mp4')
        .then(response => {
          if (response.ok) {
            videoSource.value = '/videos/Mai.mp4'
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
      // 不再显示全局错误消息，因为每个图片都有独立的错误提示
      // ElMessage.error('图片加载失败')
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
          ElMessageBox.alert('内容未编辑，假装成功投出！', '扔出成功', {
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
    
    // 显示网站说明弹窗
    const showInstructions = () => {
      dialogVisible.value = true
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
              `http://localhost:5000/uploads/${filename}`
            )
            store.updateImages(imageUrls)
          } else if (data.filename) {
            // 如果有filename字段，则构建图片URL
            const imageUrl = `http://localhost:5000/uploads/${data.filename}`
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

    // 切换评论区显示状态
    const toggleComments = async () => {
      showComments.value = !showComments.value
      
      // 如果是打开评论区，则获取最新评论
      if (showComments.value) {
        await fetchComments()
      }
    }
    
    // 添加评论
    const addComment = async () => {
      if (newComment.value.trim()) {
        // 获取共享状态中的ID
        const id = store.getId()
        
        // 检查ID是否存在
        if (!id) {
          ElMessage.error('无法发表评论：缺少内容ID')
          return
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
          })
          
          if (response.ok) {
            newComment.value = ''
            ElMessage.success('评论发表成功！')
          } else {
            console.error('服务器返回错误:', response.status)
            ElMessage.error('评论发表失败，请稍后重试')
          }
        } catch (error) {
          console.error('发表评论时出错:', error)
          ElMessage.error('网络错误，评论发表失败')
        }
      }
    }
    
    return {
      videoSource,
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
      showInstructions,
      instructionsText,
      carrierTag,
      fantasyTag,
      existTag,
      imageLoadStatus,
      showImages, // 添加 showImages 属性
      // 评论功能相关
      showComments,
      newComment,
      comments,
      toggleComments,
      addComment
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
}
  
.image-loading i {
  font-size: 20px;
  margin-bottom: 8px;
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
}
  
.image-error i {
  font-size: 24px;
  margin-bottom: 8px;
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

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(45deg, #1a2a6c, #b21f1f, #1a2a6c);
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

.content-text {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

.content-text h2 {
  margin-bottom: 20px;
  color: #333;
}

.content-meta {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.bottle-id {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.content-tags {
  margin-bottom: 20px;
}

.content-tags .tag {
  margin-right: 10px;
}

.content-text p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #555;
}

.empty-content {
  color: #999;
  font-style: italic;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 5px;
}

.content-images {
  margin-top: 20px;
  
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
    
    :deep(.el-image__inner) {
      transition: transform 0.3s ease;
      cursor: pointer;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    :deep(.el-image__placeholder) {
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .image-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
    font-size: 14px;
  }
  
  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #f56c6c;
    font-size: 14px;
  }
  
  .empty-content {
    text-align: center;
    color: #909399;
    font-size: 14px;
    padding: 40px 0;
  }
}

.image-preview {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.2);
}

.image-loading, .image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 50px;
}

.action-buttons :deep(.el-button) {
  font-size: 18px;
  padding: 20px 40px;
  border-radius: 10px;
}

.comments-section {
  max-width: 1200px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.comments-header h3 {
  margin: 0 0 20px 0;
  color: #333;
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
  line-height: 1.5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-id {
  font-size: 12px;
  color: #999;
  font-weight: bold;
}

.comment-meta {
  text-align: right;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 30px 0;
  font-style: italic;
}

.comment-form {
  margin-top: 20px;
}

.comment-actions {
  margin-top: 15px;
  text-align: right;
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
    gap: 30px;
  }
  
  .action-buttons :deep(.el-button) {
    width: 80%;
    padding: 15px 25px;
    font-size: 16px;
  }
}
</style>