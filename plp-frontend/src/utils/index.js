// 漂流瓶相关工具函数

/**
 * 格式化时间显示
 * @param {string|number|Date} time 时间戳或时间字符串
 * @returns {string} 格式化后的时间显示
 */
export function formatTime(time) {
  if (!time) return '';
  
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * 获取载体标签信息
 * @param {number} carrier 载体类型 0-牛皮纸 1-永恒纸
 * @returns {Object} 标签信息
 */
export function getCarrierTag(carrier) {
  return {
    text: carrier === 0 ? '牛皮纸' : '永恒纸',
    type: carrier === 0 ? 'primary' : 'success'
  };
}

/**
 * 获取幻想类型标签信息
 * @param {number} fantasy 幻想类型 0-空想 1-联想
 * @returns {Object} 标签信息
 */
export function getFantasyTag(fantasy) {
  return {
    text: fantasy === 0 ? '空想' : '联想',
    type: fantasy === 0 ? 'warning' : 'info'
  };
}

/**
 * 获取存续时间标签信息
 * @param {number} exist 存续时间
 * @returns {Object} 标签信息
 */
export function getExistTag(exist) {
  return {
    text: exist === 0 ? '新建' : '存续',
    type: exist === 0 ? 'danger' : 'success'
  };
}

/**
 * 根据幻想类型判断是否显示图片上传功能
 * @param {number} fantasy 幻想类型
 * @returns {boolean} 是否显示图片上传
 */
export function shouldShowImageUpload(fantasy) {
  return fantasy !== 0;
}

/**
 * 根据幻想类型获取最大文本长度
 * @param {number} fantasy 幻想类型
 * @returns {number} 最大文本长度
 */
export function getMaxTextLength(fantasy) {
  return fantasy === 0 ? 4000 : 8000;
}

/**
 * 验证图片文件
 * @param {File} file 文件对象
 * @returns {Object} 验证结果
 */
export function validateImageFile(file) {
  // 检查文件是否为图片格式
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    return {
      valid: false,
      message: '只能上传图片文件!'
    };
  }
  
  // 检查文件大小（限制为10MB）
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    return {
      valid: false,
      message: '图片大小不能超过 10MB!'
    };
  }
  
  return {
    valid: true
  };
}

/**
 * 处理图片文件转换为Base64
 * @param {File} file 文件对象
 * @returns {Promise<string>} Base64编码的图片数据
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * 检查内容是否被修改
 * @param {Object} originalContent 原始内容
 * @param {Object} currentContent 当前内容
 * @returns {boolean} 是否被修改
 */
export function isContentModified(originalContent, currentContent) {
  const isTitleChanged = originalContent.title !== currentContent.title;
  const isTextChanged = originalContent.text !== currentContent.text;
  const isImagesChanged = JSON.stringify(originalContent.images) !== JSON.stringify(currentContent.images);
  
  return isTitleChanged || isTextChanged || isImagesChanged;
}

export default {
  formatTime,
  getCarrierTag,
  getFantasyTag,
  getExistTag,
  shouldShowImageUpload,
  getMaxTextLength,
  validateImageFile,
  readFileAsBase64,
  isContentModified
};