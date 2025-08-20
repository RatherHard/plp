// API配置文件

// 基础URL配置，可以从环境变量中获取，如果没有则使用默认值
const PORT = 3001;
const BASE_URL = 'http://localhost:' + PORT;

// API端点配置
export const API_ENDPOINTS = {
  // 公共接口
  getRandom: `${BASE_URL}/api/random`,
  getKey: `${BASE_URL}/api/key`,
  upload: `${BASE_URL}/api/upload`,

  // 记录相关接口
  records: `${BASE_URL}/api/records`,

  // 管理员接口
  adminLogin: `${BASE_URL}/api/admin/login`,
  adminInit: `${BASE_URL}/api/admin/init`,
  checkAdminInitialized: `${BASE_URL}/api/admin/check`,
  verifyToken: `${BASE_URL}/api/admin/verify-token`,  // 添加验证token接口

  // 上传文件访问
  uploads: `${BASE_URL}/uploads`
};

export default {
  BASE_URL,
  API_ENDPOINTS
};