<template>
  <div class="admin-init-container">
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
      <div v-else class="fallback-background"></div>
    </div>
    
    <main class="main-content">
      <div class="init-card">
        <el-card class="init-card-content">
          <template #header>
            <div class="card-header">
              <h2>管理员密码初始化</h2>
            </div>
          </template>
          
          <div class="init-description">
            <p>检测到系统尚未设置管理员密码，请先初始化管理员密码。</p>
            <p>请输入您想要设置的管理员密码：</p>
          </div>
          
          <el-form 
            ref="initFormRef"
            :model="initForm" 
            :rules="initRules"
            label-position="top"
            @submit.prevent="handleInit"
          >
            <el-form-item label="管理员密码" prop="password">
              <el-input
                v-model="initForm.password"
                type="password"
                placeholder="请输入管理员密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="initForm.confirmPassword"
                type="password"
                placeholder="请再次输入管理员密码"
                show-password
                @keyup.enter="handleInit"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleInit"
                :loading="loading"
                class="init-button"
                size="large"
              >
                初始化密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </main>
    
    <el-dialog
      v-model="successDialogVisible"
      title="初始化成功"
      width="300px"
      center
    >
      <div class="success-dialog">
        <el-icon class="success-icon"><Check /></el-icon>
        <p>管理员密码初始化成功！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="goToManager">前往管理页面</el-button>
        </span>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="errorDialogVisible"
      title="初始化失败"
      width="300px"
      center
    >
      <div class="error-dialog">
        <el-icon class="error-icon"><CircleClose /></el-icon>
        <p>{{ errorMessage }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="errorDialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HeaderComponent from '../components/Header.vue'
import api from '../api'

export default {
  name: 'AdminInit',
  components: {
    HeaderComponent
  },
  setup() {
    const router = useRouter()
    const initFormRef = ref()
    const loading = ref(false)
    const successDialogVisible = ref(false)
    const errorDialogVisible = ref(false)
    const errorMessage = ref('')
    const videoSource = ref('')
    
    // 表单数据
    const initForm = reactive({
      password: '',
      confirmPassword: ''
    })
    
    // 表单验证规则
    const initRules = {
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== initForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 检查是否已经初始化
    const checkInitialization = async () => {
      try {
        const response = await api.checkAdminInitialization()
        if (response.isInitialized) {
          // 如果已经初始化，跳转到管理页面
          router.push('/manager')
        }
      } catch (error) {
        console.error('检查管理员初始化状态失败:', error)
      }
    }
    
    // 处理初始化
    const handleInit = async () => {
      if (!initFormRef.value) return
      
      await initFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            await api.initAdminPassword(initForm.password)
            successDialogVisible.value = true
          } catch (error) {
            errorMessage.value = error.message || '初始化失败'
            errorDialogVisible.value = true
          } finally {
            loading.value = false
          }
        } else {
          ElMessage.error('请正确填写表单')
        }
      })
    }
    
    // 前往管理页面
    const goToManager = () => {
      successDialogVisible.value = false
      router.push('/manager')
    }
    
    // 显示说明
    const showInstructions = () => {
      // 可以添加说明逻辑
    }
    
    // 设置背景视频
    const setVideoBackground = () => {
      const videos = [
        '/videos/001.mp4',
        '/videos/002.mp4',
        '/videos/003.mp4',
        '/videos/004.mp4',
        '/videos/005.mp4',
        '/videos/006.mp4',
        '/videos/007.mp4',
        '/videos/008.mp4'
      ]
      const randomVideo = videos[Math.floor(Math.random() * videos.length)]
      videoSource.value = randomVideo
    }
    
    onMounted(() => {
      checkInitialization()
      setVideoBackground()
    })
    
    return {
      initFormRef,
      initForm,
      initRules,
      loading,
      successDialogVisible,
      errorDialogVisible,
      errorMessage,
      videoSource,
      handleInit,
      goToManager,
      showInstructions
    }
  }
}
</script>

<style scoped>
.admin-init-container {
  min-height: 100vh;
  position: relative;
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
  padding: 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.init-card {
  width: 100%;
  max-width: 500px;
  margin: 20px;
}

.init-card-content {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.init-description {
  text-align: center;
  margin-bottom: 20px;
}

.init-description p {
  margin: 10px 0;
  color: #555;
}

.init-button {
  width: 100%;
  margin-top: 20px;
}

.success-dialog, .error-dialog {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 10px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 10px;
}

.success-dialog p, .error-dialog p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .init-card {
    margin: 10px;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
}
</style>