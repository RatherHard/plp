<template>
  <div class="manager-container">
    <el-container class="full-height">
      <!-- 头部 -->
      <el-header class="manager-header">
        <div class="header-content">
          <h1>
            <el-icon><ChatLineSquare /></el-icon>
            漂流瓶管理局
          </h1>
          <div class="header-actions">
            <el-button type="danger" @click="handleLogout" v-if="localStorage.getItem('adminToken')">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-container class="manager-main">
        <!-- 未登录提示 -->
        <div v-if="!localStorage.getItem('adminToken')" class="login-required">
          <el-card class="login-card">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>管理员登录</span>
              </div>
            </template>
            
            <div class="login-description">
              <p>
                <el-icon><Document /></el-icon>
                请输入管理员密码以访问审核后台
              </p>
            </div>
            
            <el-form @submit.prevent="handleLogin" class="login-form">
              <el-form-item>
                <el-input
                  v-model="loginPassword"
                  type="password"
                  placeholder="请输入管理员密码"
                  show-password
                  @keyup.enter="handleLogin"
                  size="large"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="handleLogin"
                  :loading="loginLoading"
                  class="login-button"
                  size="large"
                  round
                >
                  <el-icon v-if="!loginLoading"><User /></el-icon>
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
        
        <!-- 登录后内容 -->
        <template v-else>
          <!-- 侧边栏 -->
          <el-aside width="350px" class="sidebar">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange" stretch>
              <el-tab-pane label="待审核" name="pending">
                <template #label>
                  <el-icon><Clock /></el-icon>
                  待审核
                </template>
                <div class="content-list">
                  <el-empty v-if="pendingList.length === 0" description="暂无待审核内容" />
                  <el-card 
                    v-for="item in pendingList" 
                    :key="item.id" 
                    class="content-item-card"
                    :class="{ 'selected': selectedItem && selectedItem.id === item.id }"
                    @click="selectItem(item)"
                    shadow="hover"
                  >
                    <div class="item-header">
                      <span class="item-id">
                        <el-icon><Document /></el-icon>
                        ID: {{ item.id }}
                      </span>
                      <span class="item-time">
                        <el-icon><Clock /></el-icon>
                        {{ item.uploadTime }}
                      </span>
                    </div>
                    <div class="item-preview">
                      <p v-if="item.text">
                        <el-icon v-if="!item.filenames || item.filenames.length === 0"><Document /></el-icon>
                        <el-icon v-else><Picture /></el-icon>
                        {{ item.text.substring(0, 100) }}{{ item.text.length > 100 ? '...' : '' }}
                      </p>
                      <p v-else>
                        <el-icon><Document /></el-icon>
                        无内容
                      </p>
                    </div>
                  </el-card>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="已通过" name="approved">
                <template #label>
                  <el-icon><Check /></el-icon>
                  已通过
                </template>
                <div class="search-container">
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索漂流瓶ID..."
                    clearable
                    @clear="searchKeyword = ''"
                    size="small"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                
                <div class="content-list">
                  <el-empty v-if="filteredApprovedList.length === 0" description="暂无已通过内容" />
                  <el-card 
                    v-for="item in filteredApprovedList" 
                    :key="item.id" 
                    class="content-item-card"
                    :class="{ 'selected': selectedItem && selectedItem.id === item.id }"
                    @click="selectItem(item)"
                    shadow="hover"
                  >
                    <div class="item-header">
                      <span class="item-id">
                        <el-icon><Document /></el-icon>
                        ID: {{ item.id }}
                      </span>
                      <span class="item-time">
                        <el-icon><Clock /></el-icon>
                        {{ item.uploadTime }}
                      </span>
                    </div>
                    <div class="item-preview">
                      <p v-if="item.text">
                        <el-icon v-if="!item.filenames || item.filenames.length === 0"><Document /></el-icon>
                        <el-icon v-else><Picture /></el-icon>
                        {{ item.text.substring(0, 100) }}{{ item.text.length > 100 ? '...' : '' }}
                      </p>
                      <p v-else>
                        <el-icon><Document /></el-icon>
                        无内容
                      </p>
                    </div>
                  </el-card>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="回应审核" name="comments">
                <template #label>
                  <el-icon><ChatLineSquare /></el-icon>
                  回应审核
                </template>
                <div class="content-list">
                  <el-empty v-if="pendingCommentsList.length === 0" description="暂无待审核回应" />
                  <el-card 
                    v-for="item in pendingCommentsList" 
                    :key="item.id" 
                    class="content-item-card"
                    :class="{ 'selected': selectedItem && selectedItem.id === item.id }"
                    @click="selectItem(item)"
                    shadow="hover"
                  >
                    <div class="item-header">
                      <span class="item-id">
                        <el-icon><ChatLineSquare /></el-icon>
                        回应ID: {{ item.id }}
                      </span>
                      <span class="item-time">
                        <el-icon><Clock /></el-icon>
                        {{ item.createTime }}
                      </span>
                    </div>
                    <div class="item-preview">
                      <p v-if="item.content">
                        <el-icon><ChatLineSquare /></el-icon>
                        {{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}
                      </p>
                      <p v-else>
                        <el-icon><ChatLineSquare /></el-icon>
                        无内容
                      </p>
                    </div>
                  </el-card>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-aside>
          
          <!-- 主内容区 -->
          <el-main class="main-content">
            <div class="content-detail" v-if="selectedItem">
              <el-card class="detail-card">
                <template #header>
                  <div class="detail-header">
                    <span>
                      <el-icon><Document /></el-icon>
                      内容详情
                    </span>
                    <div class="detail-actions">
                      <template v-if="activeTab === 'pending'">
                        <el-button type="success" @click="approveContent" size="small">
                          <el-icon><Check /></el-icon>通过
                        </el-button>
                        <el-button type="danger" @click="rejectContent" size="small">
                          <el-icon><Close /></el-icon>拒绝
                        </el-button>
                      </template>
                      <template v-else-if="activeTab === 'approved'">
                        <el-button type="danger" @click="deleteContent" size="small">
                          <el-icon><Delete /></el-icon>删除
                        </el-button>
                      </template>
                      <template v-else-if="activeTab === 'comments'">
                        <el-button type="success" @click="approveComment" size="small">
                          <el-icon><Check /></el-icon>通过
                        </el-button>
                        <el-button type="danger" @click="rejectComment" size="small">
                          <el-icon><Close /></el-icon>拒绝
                        </el-button>
                      </template>
                    </div>
                  </div>
                </template>
                
                <div class="detail-body">
                  <!-- 漂流瓶内容详情 -->
                  <div v-if="activeTab !== 'comments'">
                    <el-descriptions :column="1" border size="small">
                      <el-descriptions-item label="ID">
                        <span class="detail-id">
                          <el-icon><Document /></el-icon>
                          {{ selectedItem.id }}
                        </span>
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="标题">
                        <el-icon><Edit /></el-icon>
                        {{ selectedItem.title || '无标题' }}
                      </el-descriptions-item>
                      
                      <el-descriptions-item v-if="selectedItem.originalTitle !== undefined" label="原标题">
                        <el-icon><Edit /></el-icon>
                        {{ selectedItem.originalTitle || '无标题' }}
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="上传时间">
                        <span class="detail-time">
                          <el-icon><Clock /></el-icon>
                          {{ selectedItem.uploadTime }}
                        </span>
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="内容">
                        <div class="content-text">
                          <el-icon><Document /></el-icon>
                          {{ selectedItem.text }}
                        </div>
                      </el-descriptions-item>
                      
                      <el-descriptions-item v-if="selectedItem.originalText !== undefined" label="原文">
                        <div class="content-text">
                          <el-icon><Document /></el-icon>
                          {{ selectedItem.originalText }}
                        </div>
                      </el-descriptions-item>
                      
                      <el-descriptions-item v-if="selectedItem.filenames && selectedItem.filenames.length > 0" label="图片">
                        <div class="image-container">
                          <div 
                            v-for="(filename, index) in selectedItem.filenames" 
                            :key="index"
                            class="image-preview"
                          >
                            <el-image
                              :src="completeImage(filename)"
                              fit="cover"
                              class="preview-image"
                              :preview-src-list="[completeImage(filename)]"
                              :initial-index="index"
                              :preview-teleported="true"
                              :zoom-rate="1.2"
                            >
                              <template #placeholder>
                                <div class="image-loading">
                                  <el-icon><Picture /></el-icon>
                                  加载中...
                                </div>
                              </template>
                              <template #error>
                                <div class="image-error">
                                  <el-icon><Picture /></el-icon>
                                  图片加载失败
                                </div>
                              </template>
                            </el-image>
                          </div>
                        </div>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                  
                  <!-- 回应内容详情 -->
                  <div v-else>
                    <el-descriptions :column="1" border size="small">
                      <el-descriptions-item label="回应ID">
                        <span class="detail-id">
                          <el-icon><ChatLineSquare /></el-icon>
                          {{ selectedItem.id }}
                        </span>
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="帖子ID">
                        <span class="detail-id">
                          <el-icon><Document /></el-icon>
                          {{ selectedItem.recordId }}
                        </span>
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="回应内容">
                        <div class="content-text">
                          <el-icon><ChatLineSquare /></el-icon>
                          {{ selectedItem.content || selectedItem.text }}
                        </div>
                      </el-descriptions-item>
                      
                      <el-descriptions-item label="回应时间">
                        <span class="detail-time">
                          <el-icon><Clock /></el-icon>
                          {{ selectedItem.commentTime }}
                        </span>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                  
                  <!-- 已审核帖子的回应区域 -->
                  <div class="detail-comments" v-if="activeTab === 'approved' && selectedItem">
                    <el-divider />
                    <div class="comments-section">
                      <h3>
                        <el-icon><ChatLineSquare /></el-icon>
                        已审核回应 ({{ approvedCommentsList.length }})
                      </h3>
                      
                      <div class="comment-search-bar">
                        <el-input
                          v-model="commentSearchKeyword"
                          placeholder="搜索回应ID..."
                          clearable
                          style="width: 300px; margin-bottom: 15px;"
                          size="small"
                        >
                          <template #prefix>
                            <el-icon><Search /></el-icon>
                          </template>
                        </el-input>
                      </div>
                      
                      <div class="comments-list">
                        <el-empty v-if="filteredApprovedComments.length === 0" description="暂无已审核回应" />
                        <el-card 
                          v-for="(comment, index) in filteredApprovedComments" 
                          :key="comment.id"
                          class="comment-item"
                          shadow="never"
                        >
                          <div class="comment-content">
                            <div class="comment-header">
                              <span class="item-id">
                                <el-icon><ChatLineSquare /></el-icon>
                                ID: {{ comment.id }}
                              </span>
                            </div>
                            <p>
                              <el-icon><ChatLineSquare /></el-icon>
                              {{ comment.content }}
                            </p>
                            <div class="comment-meta">
                              <span class="comment-time">
                                <el-icon><Clock /></el-icon>
                                {{ comment.commentTime }}
                              </span>
                              <el-button 
                                type="danger" 
                                size="small" 
                                @click="deleteApprovedComment(comment.id)"
                              >
                                <el-icon><Delete /></el-icon>删除
                              </el-button>
                            </div>
                          </div>
                        </el-card>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
            
            <div class="content-detail placeholder" v-else>
              <el-card class="placeholder-card">
                <el-empty description="请选择要查看的内容">
                  <template #icon>
                    <el-icon><Document /></el-icon>
                  </template>
                </el-empty>
              </el-card>
            </div>
          </el-main>
        </template>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { 
  ElMessage, 
  ElMessageBox,
  ElContainer,
  ElHeader,
  ElMain,
  ElAside,
  ElCard,
  ElTabs,
  ElTabPane,
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElImage,
  ElEmpty,
  ElDivider
} from 'element-plus'
import { 
  Search, 
  Document, 
  Picture, 
  Clock, 
  ChatLineSquare, 
  User, 
  Edit,
  Lock,
  SwitchButton,
  Check,
  Close,
  Delete
} from '@element-plus/icons-vue'
import { API_ENDPOINTS } from '../api'
import { useRouter } from 'vue-router'

export default {
  name: 'Manager',
  components: {
    Search,
    Document,
    Picture,
    Clock,
    ChatLineSquare,
    User,
    Edit,
    Lock,
    SwitchButton,
    Check,
    Close,
    Delete,
    ElContainer,
    ElHeader,
    ElMain,
    ElAside,
    ElCard,
    ElTabs,
    ElTabPane,
    ElButton,
    ElInput,
    ElForm,
    ElFormItem,
    ElTag,
    ElDescriptions,
    ElDescriptionsItem,
    ElImage,
    ElEmpty,
    ElDivider
  },
  setup() {
    console.log(API_ENDPOINTS)
    const router = useRouter()
    
    const approvedList = ref([])
    const pendingList = ref([])
    const selectedItem = ref(null)
    const activeTab = ref('pending')
    const localStorage = window.localStorage
    
    // 表单数据
    const loginPassword = ref('')
    const initPassword = ref('')
    const loginLoading = ref(false)  // 添加登录加载状态
    
    // 对话框显示控制
    const loginDialogVisible = ref(false)
    const initDialogVisible = ref(false)
    
    // 添加搜索关键字状态
    const searchKeyword = ref('')
    
    // 添加待审核回应列表状态
    const pendingCommentsList = ref([])
    
    // 添加已审核回应列表状态
    const approvedCommentsList = ref([])
    
    // 添加回应搜索关键字状态
    const commentSearchKeyword = ref('')
    
    // 添加过滤已审核列表的计算属性
    const filteredApprovedList = computed(() => {
      if (!searchKeyword.value) {
        return approvedList.value
      }
      
      // 根据帖子ID进行搜索
      return approvedList.value.filter(item => 
        item.id && item.id.toString().includes(searchKeyword.value)
      )
    })
    
    // 添加过滤已审核回应的计算属性
    const filteredApprovedComments = computed(() => {
      if (!commentSearchKeyword.value) {
        return approvedCommentsList.value
      }
      
      // 根据回应ID进行过滤（支持部分匹配）
      return approvedCommentsList.value.filter(comment => 
        comment.id && comment.id.toString().includes(commentSearchKeyword.value)
      )
    })
    
    // 显示登录弹窗
    const showLoginDialog = () => {
      loginDialogVisible.value = true
    }
    
    // 显示初始化弹窗
    const showInitDialog = () => {
      initDialogVisible.value = true
    }
    
    // 关闭登录弹窗
    const handleLoginDialogClose = (done) => {
      loginPassword.value = ''
      done()
    }
    
    // 关闭初始化弹窗
    const handleInitDialogClose = (done) => {
      initPassword.value = ''
      done()
    }
    
    // 处理管理员登录
    const handleLogin = async () => {
      if (!loginPassword.value) {
        ElMessage.warning('请输入密码')
        return
      }
      
      try {
        loginLoading.value = true  // 设置加载状态
        
        const response = await fetch(API_ENDPOINTS.adminLogin, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: loginPassword.value
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          // 将token保存到本地存储中
          localStorage.setItem('adminToken', data.token)
          loginPassword.value = ''
          ElMessage.success('登录成功')
          // 登录成功后刷新页面
          window.location.reload()
        } else {
          const errorData = await response.json()
          ElMessage.error(errorData.message || '登录失败')
        }
      } catch (error) {
        console.error('登录时出错:', error)
        ElMessage.error('网络错误，登录失败')
      } finally {
        loginLoading.value = false  // 重置加载状态
      }
    }
    
    // 处理设置密钥
    const handleInit = async () => {
      if (!initPassword.value) {
        ElMessage.warning('请输入密码')
        return
      }
      
      try {
        const response = await fetch(API_ENDPOINTS.adminInit, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: initPassword.value
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          initDialogVisible.value = false
          initPassword.value = ''
          ElMessageBox.alert(data.message || '密钥设置成功', '设置成功', {
            confirmButtonText: '确定',
            type: 'success'
          })
        } else {
          ElMessage.error(data.message || '密钥设置失败')
        }
      } catch (error) {
        console.error('设置密钥时出错:', error)
        ElMessage.error('网络错误，密钥设置失败')
      }
    }
    
    // 处理退出登录
    const handleLogout = () => {
      ElMessageBox.confirm(
        '确定要退出登录吗？退出后需要重新登录才能访问管理后台。',
        '确认退出',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      .then(() => {
        // 清除本地存储的token
        localStorage.removeItem('adminToken')
        // 重置相关状态
        pendingList.value = []
        approvedList.value = []
        selectedItem.value = null
        // 显示成功消息
        ElMessage.success('已退出登录')
      })
      .catch(() => {
        // 用户取消操作
        ElMessage.info('已取消退出操作')
      })
    }
    
    // 计算当前应该显示的列表
    const activeList = computed(() => {
      if (activeTab.value === 'pending') {
        return pendingList.value
      } else if (activeTab.value === 'comments') {
        return pendingCommentsList.value
      } else {
        // 对已审核列表进行搜索过滤
        if (!searchKeyword.value) {
          return approvedList.value
        }
        // 根据帖子ID进行搜索
        return approvedList.value.filter(item => 
          item.id && item.id.toString().includes(searchKeyword.value)
        )
      }
    })
    
    // 切换标签页
    const handleTabChange = (tab) => {
      activeTab.value = tab
      // 清空之前选中的项
      selectedItem.value = null
      
      // 根据标签页类型获取对应数据
      if (tab === 'pending') {
        fetchPendingContent()
      } else if (tab === 'approved') {
        fetchApprovedContent()
      } else if (tab === 'comments') {
        fetchPendingComments()
      }
    }
    
    // 处理图片URL
    const processImages = (images) => {
      if (!Array.isArray(images)) return []
      
      return images.map(image => {
        // 如果已经是完整URL，直接返回
        if (image.startsWith('http')) {
          return image
        }
        // 如果是文件名，构建完整URL
        return `${API_ENDPOINTS.uploads}${image}`
      })
    }

    const completeImage = (image) => {
      if (image.startsWith('http')) {
        return image
      }
      return `${API_ENDPOINTS.uploads}${image}`
    }
    
    // 获取待审核内容列表
    const fetchPendingContent = async () => {
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.records}/pending`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          pendingList.value = data
        } else {
          ElMessage.error('获取待审核内容失败')
        }
      } catch (error) {
        console.error('获取待审核内容时出错:', error)
        ElMessage.error('网络错误，获取待审核内容失败')
      }
    }
    
    // 验证管理员token是否有效
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        return false
      }
      
      try {
        const response = await fetch(API_ENDPOINTS.verifyToken, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.valid === true
        } else {
          // Token无效，清除本地存储
          localStorage.removeItem('adminToken')
          return false
        }
      } catch (error) {
        console.error('验证token时出错:', error)
        // 出错时也清除token
        localStorage.removeItem('adminToken')
        return false
      }
    }
    
    // 检查管理员密码是否已初始化
    const checkAdminInitialization = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.checkAdminInitialized)
        
        if(response.ok) {
          const data = await response.json()
          console.log('管理员状态:', data.isInitialized);
          if (!data.isInitialized) {
            // 如果未初始化，跳转到初始化页面
            router.push('/admin-init')
          } else {
            //已初始化
            return true
          }
        } else {
          ElMessage.error('无法检查管理员状态')
        }
      } catch (error) {
        console.error('检查管理员初始化状态失败:', error)
        ElMessage.error('网络错误，检查管理员状态失败')
      }
    }
    
    // 获取已通过审核的内容列表
    const fetchApprovedContent = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.records)
        if (response.ok) {
          const data = await response.json()
          approvedList.value = data
        } else {
          ElMessage.error('获取已审核内容失败')
        }
      } catch (error) {
        console.error('获取已审核内容时出错:', error)
        ElMessage.error('网络错误，获取已审核内容失败')
      }
    }
    
    // 获取待审核回应列表
    const fetchPendingComments = async () => {
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.comments}/pending`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          pendingCommentsList.value = data
        } else {
          ElMessage.error('获取待审核回应失败')
        }
      } catch (error) {
        console.error('获取待审核回应时出错:', error)
        ElMessage.error('网络错误，获取待审核回应失败')
      }
    }
    
    // 选择内容项
    const selectItem = async (item) => {
      selectedItem.value = item
      
      // 如果是已审核标签页，获取对应的已审核回应
      if (activeTab.value === 'approved') {
        await fetchApprovedComments(item.id)
      }
    }
    
    // 通过内容
    const approveContent = async () => {
      if (!selectedItem.value) return
      
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            status: 'approved'
          })
        })
        
        if (response.ok) {
          ElMessage.success('内容已通过审核')
          // 从待审核列表中移除
          pendingList.value = pendingList.value.filter(item => item.id !== selectedItem.value.id)
          // 添加到已通过列表
          approvedList.value.unshift(selectedItem.value)
          selectedItem.value = null
        } else {
          ElMessage.error('审核操作失败')
        }
      } catch (error) {
        console.error('审核内容时出错:', error)
        ElMessage.error('网络错误，审核操作失败')
      }
    }
    
    // 拒绝内容
    const rejectContent = async () => {
      if (!selectedItem.value) return
      
      // 检查内容是否发生变化
      const ifChange = (selectedItem.value.originalText !== undefined && selectedItem.value.originalText !== selectedItem.value.text) || 
                      (selectedItem.value.originalTitle !== undefined && selectedItem.value.originalTitle !== selectedItem.value.title) ? 1 : 0;
      
      // 如果内容发生变化
      if (ifChange === 1) {
        try {
          // 第一步：先通过审核（需要携带token）
          const token = localStorage.getItem('adminToken');
          const headers = {
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = 'Bearer ' + token;
          }
          
          const approveResponse = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              status: 'approved'
            })
          });
          
          if (!approveResponse.ok) {
            const errorData = await approveResponse.json();
            ElMessage.error(errorData.message || '通过审核失败');
            return;
          }
          
          // 第二步：恢复原始内容
          const restoreData = new FormData();
          restoreData.append('text', selectedItem.value.originalText || '');
          restoreData.append('title', selectedItem.value.originalTitle || '');
          
          // 添加所有图片
          if (selectedItem.value.images && Array.isArray(selectedItem.value.images)) {
            selectedItem.value.images.forEach((image, index) => {
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
                restoreData.append('images', imageBlob, `bottle-image-${index}.png`);
              } else {
                // 如果不是Base64数据，可能需要其他处理方式
                console.warn('图片不是Base64格式，可能需要特殊处理');
              }
            });
          } else if (selectedItem.value.filenames && Array.isArray(selectedItem.value.filenames)) {
            // 如果有filenames字段，需要处理这些图片
            // 这里可能需要根据实际情况进行处理
            console.warn('处理filenames字段的图片逻辑需要根据实际情况实现');
          }
          
          // 发送恢复原始内容的请求（不需要携带token）
          const restoreResponse = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}`, {
            method: 'PUT',
            body: restoreData
          });
          
          if (restoreResponse.ok) {
            const approveResponse = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                status: 'approved'
              })
            });
            
            if (!approveResponse.ok) {
              const errorData = await approveResponse.json();
              ElMessage.error(errorData.message || '通过审核失败');
              return;
            }
            
            ElMessage.success('内容已通过审核并恢复为原始版本');
            // 从待审核列表中移除
            pendingList.value = pendingList.value.filter(item => item.id !== selectedItem.value.id);
            // 添加到已通过列表
            approvedList.value.unshift(selectedItem.value);
            selectedItem.value = null;
            // 重新获取已审核列表
            await fetchApprovedContent();
          } else {
            ElMessage.error('恢复原始内容失败');
          }
        } catch (error) {
          console.error('处理内容变化时出错:', error);
          ElMessage.error('网络错误，处理失败');
        }
      } else {
        // 如果内容没有发生变化，执行原来的拒绝逻辑
        try {
          // 从本地存储获取token
          const token = localStorage.getItem('adminToken')
          
          // 准备请求头
          const headers = {
            'Content-Type': 'application/json'
          }
          
          // 如果有token，则添加到Authorization头
          if (token) {
            headers['Authorization'] = 'Bearer ' + token
          }
          
          const response = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              status: 'rejected'
            })
          })
          
          if (response.ok) {
            ElMessage.success('内容已拒绝')
            // 从待审核列表中移除
            pendingList.value = pendingList.value.filter(item => item.id !== selectedItem.value.id)
            selectedItem.value = null
            // 重新获取已审核列表
            await fetchApprovedContent()
          } else {
            const errorData = await response.json()
            ElMessage.error(errorData.message || '拒绝内容失败')
          }
        } catch (error) {
          console.error('拒绝内容时出错:', error)
          ElMessage.error('网络错误，拒绝内容失败')
        }
      }
    }
    
    // 删除已审核内容
    const deleteContent = async () => {
      if (!selectedItem.value) return
      
      try {
        // 显示确认对话框
        await ElMessageBox.confirm(
          '确定要删除这个已审核的内容吗？此操作无法撤销。',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        // 发送删除请求
        const response = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}`, {
          method: 'DELETE',
          headers
        })
        
        if (response.ok) {
          ElMessage.success('内容已删除')
          // 从已审核列表中移除
          approvedList.value = approvedList.value.filter(item => item.id !== selectedItem.value.id)
          selectedItem.value = null
          // 重新获取列表
          await fetchApprovedContent()
        } else {
          const errorData = await response.json()
          ElMessage.error(errorData.message || '删除内容失败')
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          ElMessage.info('已取消删除操作')
          return
        }
        
        console.error('删除内容时出错:', error)
        ElMessage.error('网络错误，删除内容失败')
      }
    }
    
    // 通过回应
    const approveComment = async () => {
      if (!selectedItem.value) return
      
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.comments}/${selectedItem.value.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            status: 'approved'
          })
        })
        
        if (response.ok) {
          ElMessage.success('回应审核通过')
          // 从待审核回应列表中移除该项
          const index = pendingCommentsList.value.findIndex(item => item.id === selectedItem.value.id)
          if (index > -1) {
            pendingCommentsList.value.splice(index, 1)
          }
          // 清空选中项
          selectedItem.value = null
        } else {
          ElMessage.error('回应审核失败')
        }
      } catch (error) {
        console.error('回应审核时出错:', error)
        ElMessage.error('网络错误，回应审核失败')
      }
    }
    
    // 拒绝回应
    const rejectComment = async () => {
      if (!selectedItem.value) return
      
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.comments}/${selectedItem.value.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            status: 'rejected'
          })
        })
        
        if (response.ok) {
          ElMessage.success('回应已拒绝')
          // 从待审核回应列表中移除该项
          const index = pendingCommentsList.value.findIndex(item => item.id === selectedItem.value.id)
          if (index > -1) {
            pendingCommentsList.value.splice(index, 1)
          }
          // 清空选中项
          selectedItem.value = null
        } else {
          ElMessage.error('拒绝回应失败')
        }
      } catch (error) {
        console.error('拒绝回应时出错:', error)
        ElMessage.error('网络错误，拒绝回应失败')
      }
    }
    
    // 删除已审核回应
    const deleteApprovedComment = async (commentId) => {
      try {
        // 显示确认对话框
        await ElMessageBox.confirm(
          '确定要删除这条回应吗？此操作不可恢复。',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        // 发送删除请求
        const response = await fetch(`${API_ENDPOINTS.comments}/${commentId}`, {
          method: 'DELETE',
          headers
        })
        
        if (response.ok) {
          ElMessage.success('回应已删除')
          // 从已审核回应列表中移除
          approvedCommentsList.value = approvedCommentsList.value.filter(comment => comment.id !== commentId)
          // 如果当前选中的内容是这个回应所属的内容，重新获取回应列表
          if (selectedItem.value) {
            await fetchApprovedComments(selectedItem.value.id)
          }
        } else {
          const errorData = await response.json()
          ElMessage.error(errorData.message || '删除回应失败')
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          ElMessage.info('已取消删除操作')
          return
        }
        
        console.error('删除回应时出错:', error)
        ElMessage.error('网络错误，删除回应失败')
      }
    }
    
    // 获取已审核回应列表
    const fetchApprovedComments = async (recordId) => {
      try {
        // 从本地存储获取token
        const token = localStorage.getItem('adminToken')
        
        // 准备请求头
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // 如果有token，则添加到Authorization头
        if (token) {
          headers['Authorization'] = 'Bearer ' + token
        }
        
        const response = await fetch(`${API_ENDPOINTS.records}/${recordId}/comments/`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          approvedCommentsList.value = data
        } else {
          ElMessage.error('获取已审核回应失败')
          approvedCommentsList.value = []
        }
      } catch (error) {
        console.error('获取已审核回应时出错:', error)
        ElMessage.error('网络错误，获取已审核回应失败')
        approvedCommentsList.value = []
      }
    }
    
    // 组件挂载时获取内容列表
    onMounted(async () => {
      await checkAdminInitialization()

      const token = localStorage.getItem('adminToken')
      if (token) {
        // 检查token是否有效
        const isTokenValid = await verifyToken()
        if (isTokenValid) {
          // token有效，获取内容列表
          await fetchPendingContent()
          await fetchApprovedContent()
        } else {
          // token无效，检查管理员密码是否已初始化
          const isInit = await checkAdminInitialization()
          if(isInit){
            ElMessage.error('管理员Token已过期，请重新登录')
            window.location.reload()
          }
        }
      }
    })
    
    return {
      pendingList,
      approvedList,
      selectedItem,
      activeTab,
      loginDialogVisible,
      initDialogVisible,
      loginPassword,
      initPassword,
      showLoginDialog,
      showInitDialog,
      handleLoginDialogClose,
      handleInitDialogClose,
      handleLogin,
      handleInit,
      handleLogout,
      activeList,
      handleTabChange,
      processImages,
      fetchPendingContent,
      fetchApprovedContent,
      fetchPendingComments,
      selectItem,
      approveContent,
      rejectContent,
      deleteContent,
      approveComment,
      rejectComment,
      fetchApprovedComments,
      deleteApprovedComment, // 添加删除已审核回应方法
      localStorage,
      searchKeyword,
      commentSearchKeyword, // 添加回应搜索关键字状态
      filteredApprovedComments, // 添加过滤已审核回应的计算属性
      pendingCommentsList, // 暴露待审核回应列表
      approvedCommentsList, // 暴露已审核回应列表
      completeImage,
      filteredApprovedList
    }
  }
}
</script>

<style scoped>
.manager-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.full-height {
  height: 100%;
}

.manager-header {
  background: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  height: 60px !important;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manager-header h1 {
  color: #333333;
  margin: 0;
  font-size: 24px;
}

.manager-header h1 .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.manager-main {
  height: calc(100% - 60px);
}

.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.login-card {
  width: 90%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
}

.card-header {
  font-weight: bold;
  font-size: 18px;
  color: #333333;
  text-align: center;
}

.card-header .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.login-description {
  text-align: center;
  margin-bottom: 20px;
}

.login-description p {
  margin: 0;
  color: #666666;
}

.login-description p .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.login-form {
  text-align: left;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.sidebar {
  background: #ffffff;
  border-right: 1px solid #e6e6e6;
  padding: 15px;
  overflow: hidden;
}

.filter-card {
  height: 100%;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__item) {
  color: #666666;
  font-weight: normal;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
}

.search-container {
  padding: 10px 0;
}

.content-list {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding-right: 5px;
}

.content-list::-webkit-scrollbar {
  width: 6px;
}

.content-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.content-item-card {
  margin-bottom: 15px;
  background: #fafafa;
  border: 1px solid #e6e6e6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.content-item-card:hover {
  background: #f0f9ff;
  border-color: #409eff;
}

.content-item-card.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666666;
}

.item-header .el-icon {
  margin-right: 4px;
  vertical-align: middle;
}

.item-preview p {
  margin: 0;
  color: #333333;
  font-size: 14px;
  line-height: 1.4;
}

.item-preview .el-icon {
  margin-right: 6px;
  vertical-align: middle;
}

.main-content {
  padding: 15px;
  background-color: #f5f5f5;
}

.detail-card {
  height: 100%;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #e6e6e6;
  padding: 15px 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333333;
  font-size: 18px;
  font-weight: bold;
}

.detail-header .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 10px 0;
  color: #333333;
}

.content-text .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-preview {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  border: 1px solid #e6e6e6;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-loading, .image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: #999999;
}

.image-loading .el-icon,
.image-error .el-icon {
  margin-right: 6px;
}

.detail-comments {
  margin-top: 20px;
}

.comments-section h3 {
  margin: 0 0 15px 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
}

.comments-section h3 .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  margin-bottom: 10px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}

.comment-content p {
  margin: 0 0 8px 0;
  color: #333333;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
}

.comment-content p .el-icon {
  margin-right: 6px;
  vertical-align: middle;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666666;
}

.comment-meta .el-icon {
  margin-right: 4px;
  vertical-align: middle;
}

.content-detail.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-empty__description) {
  color: #999999 !important;
}

/* 通用图标间距样式 */
.el-icon + span,
span + .el-icon {
  margin-left: 6px;
}

.el-icon + span:first-child {
  margin-left: 0;
}

.el-button .el-icon {
  margin-right: 4px;
}

/* ID 和时间样式优化 */
.item-id,
.detail-id,
.item-time,
.detail-time {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.item-id,
.detail-id {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
}

.item-time,
.detail-time {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #e9e9eb;
}

.item-id .el-icon,
.detail-id .el-icon,
.item-time .el-icon,
.detail-time .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

.comment-header .item-id {
  margin-bottom: 8px;
}
</style>
