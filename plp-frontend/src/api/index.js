import { API_ENDPOINTS } from '../api';

/**
 * 统一的API调用客户端
 */
class ApiClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.base.replace('/api', '');
  }

  /**
   * 通用请求方法
   * @param {string} url - 请求地址
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求Promise
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 获取随机漂流瓶
  async getRandomBottle() {
    return this.request(API_ENDPOINTS.getRandom);
  }

  // 获取密钥
  async getKey() {
    return this.request(API_ENDPOINTS.getKey);
  }

  // 上传漂流瓶
  async uploadBottle(data) {
    return this.request(API_ENDPOINTS.upload, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 获取记录
  async getRecords() {
    return this.request(API_ENDPOINTS.records);
  }

  // 获取评论
  async getComments(bottleId) {
    const url = `${API_ENDPOINTS.comments}?id=${bottleId}`;
    return this.request(url);
  }

  // 添加评论
  async addComment(data) {
    return this.request(API_ENDPOINTS.comments, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 管理员登录
  async adminLogin(password) {
    return this.request(API_ENDPOINTS.adminLogin, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  // 初始化管理员
  async initAdmin(password) {
    return this.request(API_ENDPOINTS.adminInit, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  // 检查管理员是否已初始化
  async checkAdminInitialized() {
    return this.request(API_ENDPOINTS.checkAdminInitialized);
  }

  // 验证Token
  async verifyToken(token) {
    return this.request(API_ENDPOINTS.verifyToken, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

// 创建并导出API客户端实例
export const apiClient = new ApiClient();

export default {
  apiClient,
  API_ENDPOINTS
};