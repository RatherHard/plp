import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data
  },
  error => {
    // 对响应错误做点什么
    if (error.response && error.response.status === 401) {
      // 未授权，清除本地token
      localStorage.removeItem('adminToken')
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// 获取秘钥
export const getKey = () => api.get('/key')

// 验证秘钥
export const validateKey = (keyData) => api.post('/validate-key', keyData)

// 提交内容
export const submitContent = (contentData) => {
  const formData = new FormData()
  formData.append('data', JSON.stringify(contentData.info))
  
  if (contentData.files && contentData.files.length > 0) {
    contentData.files.forEach((file, index) => {
      formData.append(`files`, file)
    })
  }
  
  return api.post('/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取随机内容
export const getRandomContent = (params) => api.get('/random', { params })

// 获取指定ID的内容
export const getContentById = (id) => api.get(`/content/${id}`)

// 获取内容（通过源ID）
export const getContentBySource = (source) => api.get(`/content/source/${source}`)

// 获取待审核内容列表
export const getPendingContents = () => api.get('/admin/contents/pending')

// 审核内容
export const reviewContent = (id, status, editData = null) => {
  const data = { status }
  if (editData) {
    data.editData = editData
  }
  return api.put(`/admin/contents/${id}/review`, data)
}

// 获取待审核评论列表
export const getPendingComments = () => api.get('/admin/comments/pending')

// 审核评论
export const reviewComment = (id, status) => api.put(`/admin/comments/${id}/review`, { status })

// 编辑内容
export const editContent = (id, editData) => api.put(`/admin/contents/${id}`, editData)

// 删除内容
export const deleteContent = (id) => api.delete(`/admin/contents/${id}`)

// 删除评论
export const deleteComment = (id) => api.delete(`/admin/comments/${id}`)

// 管理员登录
export const adminLogin = (password) => api.post('/admin/login', { password })

// 检查管理员密码是否已初始化
export const checkAdminInitialization = () => api.get('/admin/check')

// 初始化管理员密码
export const initAdminPassword = (password) => api.post('/admin/init', { password })

export default api