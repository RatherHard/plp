// 根据环境确定API基础URL
const getBaseUrl = () => {
  // 开发环境使用本地地址
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  // 生产环境使用线上地址
  else {
    const PORT = 5208;
    return 'https://plp-bak.home.cszj.wang:' + PORT;
  }
};

const BASE_URL = getBaseUrl();

// API端点配置
export const API_ENDPOINTS = {
  // 基础接口
  base: `${BASE_URL}/api`,

  // 公共接口
  getRandom: `${BASE_URL}/api/random`,
  getKey: `${BASE_URL}/api/key`,
  upload: `${BASE_URL}/api/upload`,

  // 记录相关接口
  records: `${BASE_URL}/api/records`,
  comments: `${BASE_URL}/api/comments`,

  // 管理员接口
  adminLogin: `${BASE_URL}/api/admin/login`,
  adminInit: `${BASE_URL}/api/admin/init`,
  checkAdminInitialized: `${BASE_URL}/api/admin/check`,
  verifyToken: `${BASE_URL}/api/admin/verify-token`,  // 添加验证token接口

  // 上传文件访问
  uploads: `${BASE_URL}/uploads/`
};

export default {
  BASE_URL,
  API_ENDPOINTS
};