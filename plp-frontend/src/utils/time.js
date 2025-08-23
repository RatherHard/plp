/**
 * 格式化时间显示
 * @param {string|number|Date} time - 时间戳或日期字符串
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
    // 超过30天显示具体日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * 格式化上传时间显示
 * @param {string|number|Date} time - 时间戳或日期字符串
 * @returns {string} 格式化后的上传时间显示
 */
export function formatUploadTime(time) {
  if (!time) return '';
  
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default {
  formatTime,
  formatUploadTime
};