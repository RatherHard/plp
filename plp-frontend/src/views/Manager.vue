<template>
  <div class="manager-container">
    <header class="manager-header">
      <h1>漂流瓶管理局</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showLoginDialog" v-if="!localStorage.getItem('adminToken')">管理员登录</el-button>
        <el-button type="success" @click="showInitDialog" v-if="!localStorage.getItem('adminToken')">设置密钥</el-button>
        <el-button type="danger" @click="handleLogout" v-else>退出登录</el-button>
      </div>
    </header>
    
    <!-- 管理员登录弹窗 -->
    <el-dialog
      v-model="loginDialogVisible"
      title="管理员登录"
      width="400px"
      :before-close="handleLoginDialogClose"
    >
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="密码">
          <el-input
            v-model="loginPassword"
            type="password"
            placeholder="请输入管理员密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="loginDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 设置密钥弹窗 -->
    <el-dialog
      v-model="initDialogVisible"
      title="设置密钥"
      width="400px"
      :before-close="handleInitDialogClose"
    >
      <el-form @submit.prevent="handleInit">
        <el-form-item label="密码">
          <el-input
            v-model="initPassword"
            type="password"
            placeholder="请输入初始化密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="initDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleInit">设置</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 未登录提示 -->
    <div v-if="!localStorage.getItem('adminToken')" class="login-required">
      <div class="login-prompt">
        <h2>需要管理员权限</h2>
        <p>请先登录管理员账户以访问审核后台</p>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <main class="manager-main" v-else>
      <div class="sidebar">
        <div class="filter-buttons">
          <el-button 
            :type="activeTab === 'pending' ? 'primary' : 'default'" 
            @click="switchTab('pending')"
          >
            待审核
          </el-button>
          <el-button 
            :type="activeTab === 'approved' ? 'primary' : 'default'" 
            @click="switchTab('approved')"
          >
            已通过
          </el-button>
          <el-button 
            :type="activeTab === 'comments' ? 'primary' : 'default'" 
            @click="switchTab('comments')"
          >
            回应审核
          </el-button>
        </div>
        
        <!-- 搜索栏 (仅在已审核标签页显示) -->
        <div class="search-bar" v-if="activeTab === 'approved'">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索漂流瓶ID..."
            clearable
            @clear="searchKeyword = ''"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="content-list">
          <div 
            v-for="item in activeList" 
            :key="item.id" 
            class="content-item"
            :class="{ 'selected': selectedItem && selectedItem.id === item.id }"
            @click="selectItem(item)"
          >
            <div class="item-header" v-if="activeTab !== 'comments'">
              <span class="item-id">ID: {{ item.id }}</span>
              <span class="item-time">{{ item.uploadTime }}</span>
            </div>
            <div class="item-header" v-else>
              <span class="item-id">评论ID: {{ item.id }}</span>
              <span class="item-time">{{ item.createTime }}</span>
            </div>
            <div class="item-preview">
              <p v-if="item.text">{{ item.text.substring(0, 100) }}{{ item.text.length > 100 ? '...' : '' }}</p>
              <p v-else-if="item.content">{{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}</p>
              <p v-else>无内容</p>
            </div>
          </div>
          <div v-if="activeList.length === 0" class="no-content">
            暂无内容
          </div>
        </div>
      </div>
      
      <div class="content-detail" v-if="selectedItem">
        <div class="detail-header">
          <h2>内容详情</h2>
          <div class="detail-actions" v-if="activeTab === 'pending'">
            <el-button type="success" @click="approveContent">通过</el-button>
            <el-button type="danger" @click="rejectContent">拒绝</el-button>
          </div>
          <div class="detail-actions" v-else-if="activeTab === 'approved'">
            <el-button type="danger" @click="deleteContent">删除</el-button>
          </div>
          <div class="detail-actions" v-else-if="activeTab === 'comments'">
            <el-button type="success" @click="approveComment">通过</el-button>
            <el-button type="danger" @click="rejectComment">拒绝</el-button>
          </div>
        </div>
        
        <div class="detail-info" v-if="activeTab !== 'comments'">
          <div class="info-row">
            <span class="info-label">ID:</span>
            <span class="info-value">{{ selectedItem.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">标题:</span>
            <span class="info-value">{{ selectedItem.title || '无标题' }}</span>
          </div>
          <div class="info-row" v-if="selectedItem.originalTitle !== undefined">
            <span class="info-label">原标题:</span>
            <span class="info-value">{{ selectedItem.originalTitle || '无标题' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">上传时间:</span>
            <span class="info-value">{{ selectedItem.uploadTime }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">内容:</span>
            <span class="info-value content-text">{{ selectedItem.text }}</span>
          </div>
          <div class="info-row" v-if="selectedItem.originalText !== undefined">
            <span class="info-label">原文:</span>
            <span class="info-value content-text">{{ selectedItem.originalText }}</span>
          </div>
          <div class="info-row" v-if="selectedItem.images && selectedItem.images.length > 0">
            <span class="info-label">图片:</span>
            <div class="info-value">
              <div 
                v-for="(image, index) in processImages(selectedItem.images)" 
                :key="index"
                class="image-preview"
              >
                <el-image
                  :src="image"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="processImages(selectedItem.images)"
                  :initial-index="index"
                  :preview-teleported="true"
                  :zoom-rate="1.2"
                >
                  <template #placeholder>
                    <div class="image-loading">加载中...</div>
                  </template>
                  <template #error>
                    <div class="image-error">图片加载失败</div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
          <div class="info-row" v-else-if="selectedItem.filenames && selectedItem.filenames.length > 0">
            <span class="info-label">图片:</span>
            <div class="info-value">
              <div 
                v-for="(filename, index) in selectedItem.filenames" 
                :key="index"
                class="image-preview"
              >
                <el-image
                  :src="`${API_ENDPOINTS.uploads}${filename}`"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="selectedItem.filenames.map(name => `${API_ENDPOINTS.uploads}${name}`)"
                  :initial-index="index"
                  :preview-teleported="true"
                  :zoom-rate="1.2"
                >
                  <template #placeholder>
                    <div class="image-loading">加载中...</div>
                  </template>
                  <template #error>
                    <div class="image-error">图片加载失败</div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
          <div class="info-row" v-else-if="selectedItem.filename">
            <span class="info-label">图片:</span>
            <div class="info-value">
              <div class="image-preview">
                <el-image
                  :src="`${API_ENDPOINTS.uploads}${selectedItem.filename}`"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="[`${API_ENDPOINTS.uploads}${selectedItem.filename}`]"
                  :initial-index="0"
                  :preview-teleported="true"
                  :zoom-rate="1.2"
                >
                  <template #placeholder>
                    <div class="image-loading">加载中...</div>
                  </template>
                  <template #error>
                    <div class="image-error">图片加载失败</div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 已审核帖子的评论区域 -->
        <div class="detail-comments" v-if="activeTab === 'approved' && selectedItem">
          <div class="comments-header">
            <h3>已审核评论 ({{ approvedCommentsList.length }})</h3>
          </div>
          
          <!-- 评论搜索栏 -->
          <div class="comment-search-bar">
            <el-input
              v-model="commentSearchKeyword"
              placeholder="搜索评论ID..."
              clearable
              style="width: 300px; margin-bottom: 15px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="comments-list">
            <div 
              v-for="(comment, index) in filteredApprovedComments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-content">
                <div class="comment-header" v-if="comment.id">
                  <span class="comment-id">ID: {{ comment.id }}</span>
                </div>
                <p>{{ comment.content }}</p>
                <div class="comment-meta">
                  <span class="comment-time">{{ comment.commentTime }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="deleteApprovedComment(comment.id)"
                    style="margin-left: 10px;"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            
            <div v-if="filteredApprovedComments.length === 0" class="no-comments">
              {{
                commentSearchKeyword ? 
                `未找到ID包含"${commentSearchKeyword}"的评论` : 
                '暂无已审核评论'
              }}
            </div>
          </div>
        </div>
        
        <div class="detail-info" v-else-if="activeTab === 'comments'">
          <div class="info-row">
            <span class="info-label">评论ID:</span>
            <span class="info-value">{{ selectedItem.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">帖子ID:</span>
            <span class="info-value">{{ selectedItem.recordId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">评论内容:</span>
            <span class="info-value content-text">{{ selectedItem.content || selectedItem.text }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">评论时间:</span>
            <span class="info-value">{{ selectedItem.commentTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="content-detail placeholder" v-else>
        <div class="placeholder-text">
          请选择要查看的内容
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { API_ENDPOINTS } from '../api'
import { useRouter } from 'vue-router'

export default {
  name: 'Manager',
  components: {
    Search
  },
  setup() {
    const router = useRouter()
    
    const approvedList = ref([])
    const pendingList = ref([])
    const selectedItem = ref(null)
    const activeTab = ref('pending')
    const loginDialogVisible = ref(false)
    const initDialogVisible = ref(false)
    const loginPassword = ref('')
    const initPassword = ref('')
    
    // 添加搜索关键字状态
    const searchKeyword = ref('')
    
    // 添加待审核评论列表状态
    const pendingCommentsList = ref([])
    
    // 添加已审核评论列表状态
    const approvedCommentsList = ref([])
    
    // 添加评论搜索关键字状态
    const commentSearchKeyword = ref('')
    
    // 添加过滤已审核评论的计算属性
    const filteredApprovedComments = computed(() => {
      if (!commentSearchKeyword.value) {
        return approvedCommentsList.value
      }
      
      // 根据评论ID进行过滤（支持部分匹配）
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
          loginDialogVisible.value = false
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
    const switchTab = (tab) => {
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
        return `${API_ENDPOINTS.uploads}/${image}`
      })
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
    
    // 检查管理员密码是否已初始化
    const checkAdminInitialization = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.checkAdminInitialized)
        
        if(response.ok) {
          const data = await response.json()
          
          if (!data.isInitialized) {
            // 如果未初始化，跳转到初始化页面
            router.push('/admin-init')
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
    
    // 获取待审核评论列表
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
        
        const response = await fetch(`${API_ENDPOINTS.records}/comments/pending`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          pendingCommentsList.value = data
        } else {
          ElMessage.error('获取待审核评论失败')
        }
      } catch (error) {
        console.error('获取待审核评论时出错:', error)
        ElMessage.error('网络错误，获取待审核评论失败')
      }
    }
    
    // 选择内容项
    const selectItem = async (item) => {
      selectedItem.value = item
      
      // 如果是已审核标签页，获取对应的已审核评论
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
    
    // 通过评论
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
        
        const response = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            status: 'approved'
          })
        })
        
        if (response.ok) {
          ElMessage.success('评论审核通过')
          // 从待审核评论列表中移除该项
          const index = pendingCommentsList.value.findIndex(item => item.id === selectedItem.value.id)
          if (index > -1) {
            pendingCommentsList.value.splice(index, 1)
          }
          // 清空选中项
          selectedItem.value = null
        } else {
          ElMessage.error('评论审核失败')
        }
      } catch (error) {
        console.error('评论审核时出错:', error)
        ElMessage.error('网络错误，评论审核失败')
      }
    }
    
    // 拒绝评论
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
        
        const response = await fetch(`${API_ENDPOINTS.records}/${selectedItem.value.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            status: 'rejected'
          })
        })
        
        if (response.ok) {
          ElMessage.success('评论已拒绝')
          // 从待审核评论列表中移除该项
          const index = pendingCommentsList.value.findIndex(item => item.id === selectedItem.value.id)
          if (index > -1) {
            pendingCommentsList.value.splice(index, 1)
          }
          // 清空选中项
          selectedItem.value = null
        } else {
          ElMessage.error('拒绝评论失败')
        }
      } catch (error) {
        console.error('拒绝评论时出错:', error)
        ElMessage.error('网络错误，拒绝评论失败')
      }
    }
    
    // 删除已审核评论
    const deleteApprovedComment = async (commentId) => {
      try {
        // 显示确认对话框
        await ElMessageBox.confirm(
          '确定要删除这条评论吗？此操作不可恢复。',
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
        const response = await fetch(`${API_ENDPOINTS.records}/${commentId}`, {
          method: 'DELETE',
          headers
        })
        
        if (response.ok) {
          ElMessage.success('评论已删除')
          // 从已审核评论列表中移除
          approvedCommentsList.value = approvedCommentsList.value.filter(comment => comment.id !== commentId)
          // 如果当前选中的内容是这个评论所属的内容，重新获取评论列表
          if (selectedItem.value) {
            await fetchApprovedComments(selectedItem.value.id)
          }
        } else {
          const errorData = await response.json()
          ElMessage.error(errorData.message || '删除评论失败')
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          ElMessage.info('已取消删除操作')
          return
        }
        
        console.error('删除评论时出错:', error)
        ElMessage.error('网络错误，删除评论失败')
      }
    }
    
    // 获取已审核评论列表
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
          ElMessage.error('获取已审核评论失败')
          approvedCommentsList.value = []
        }
      } catch (error) {
        console.error('获取已审核评论时出错:', error)
        ElMessage.error('网络错误，获取已审核评论失败')
        approvedCommentsList.value = []
      }
    }
    
    // 组件挂载时获取内容列表
    onMounted(async () => {
      // 检查是否已登录
      const token = localStorage.getItem('adminToken')
      if (token) {
        // 已登录，获取内容列表
        await fetchPendingContent()
        await fetchApprovedContent()
      } else {
        // 检查管理员密码是否已初始化
        await checkAdminInitialization()
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
      switchTab,
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
      deleteApprovedComment, // 添加删除已审核评论方法
      localStorage,
      searchKeyword,
      commentSearchKeyword, // 添加评论搜索关键字状态
      filteredApprovedComments, // 添加过滤已审核评论的计算属性
      pendingCommentsList, // 暴露待审核评论列表
      approvedCommentsList // 暴露已审核评论列表
    }
  }
}
</script>

<style scoped>
.manager-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.manager-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manager-header h1 {
  color: white;
  margin: 0;
  font-size: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.login-required {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.login-prompt {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-prompt h2 {
  color: white;
  margin-bottom: 15px;
  font-size: 28px;
}

.login-prompt p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 25px;
  font-size: 16px;
}

.manager-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-bar .el-input__wrapper {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  box-shadow: none;
}

.search-bar .el-input__inner {
  color: white;
  background: transparent;
}

.search-bar .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-bar .el-icon {
  color: rgba(255, 255, 255, 0.7);
}

.filter-buttons {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  gap: 10px;
}

.filter-buttons :deep(.el-button) {
  flex: 1;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-buttons :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}

.filter-buttons :deep(.el-button--primary) {
  background: rgba(64, 158, 255, 0.8);
}

.content-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.content-item {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.content-item:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.content-item.selected {
  background: rgba(64, 158, 255, 0.3);
  border-color: #409eff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.item-id {
  font-weight: bold;
}

.item-time {
  font-style: italic;
}

.item-preview p {
  margin: 0;
  color: white;
  font-size: 14px;
  line-height: 1.4;
}

.no-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  padding: 30px 0;
}

.content-detail {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20px;
  overflow-y: auto;
}

.content-detail.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  text-align: center;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-header h2 {
  color: white;
  margin: 0;
  font-size: 22px;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.detail-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 15px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 80px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: white;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.image-preview {
  display: inline-block;
  width: 150px;
  height: 150px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
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
  color: rgba(255, 255, 255, 0.6);
}

.reject-dialog .el-textarea {
  width: 100%;
}

.reject-dialog .el-textarea :deep(textarea) {
  min-height: 100px !important;
}

/* 评论区域样式 */
.detail-comments {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.comment-search-bar {
  margin-bottom: 15px;
}

.comment-search-bar .el-input__wrapper {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  box-shadow: none;
}

.comment-search-bar .el-input__inner {
  color: white;
  background: transparent;
}

.comment-search-bar .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.comment-search-bar .el-icon {
  color: rgba(255, 255, 255, 0.7);
}

.comments-header h3 {
  margin: 0 0 15px 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.comment-item {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  margin-bottom: 10px;
  transition: background 0.3s ease;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.comment-content p {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.comment-time {
  font-style: italic;
}

.no-comments {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 25px;
  font-style: italic;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

/* 禁用图片预览时的鼠标滚轮控制滚动条 */
.el-image-viewer__wrapper {
  overscroll-behavior: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>