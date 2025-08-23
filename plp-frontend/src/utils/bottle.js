/**
 * 获取载体标签信息
 * @param {number} carrier - 载体类型 (0: 牛皮纸, 1: 永恒纸)
 * @returns {Object} 标签信息对象
 */
export function getCarrierTag(carrier) {
  return {
    text: carrier === 0 ? '牛皮纸' : '永恒纸',
    type: carrier === 0 ? 'primary' : 'success'
  };
}

/**
 * 获取幻想类型标签信息
 * @param {number} fantasy - 幻想类型 (0: 空想, 1: 联想)
 * @returns {Object} 标签信息对象
 */
export function getFantasyTag(fantasy) {
  return {
    text: fantasy === 0 ? '空想' : '联想',
    type: fantasy === 0 ? 'warning' : 'info'
  };
}

/**
 * 获取存续时间标签信息
 * @param {number|null} exist - 存续时间(天数)
 * @returns {Object} 标签信息对象
 */
export function getExistTag(exist) {
  // 如果没有存续时间信息，显示默认标签
  if (exist === null || exist === undefined) {
    return {
      text: '无瑕的漂流瓶',
      type: 'primary'
    };
  }

  // 根据存续时间返回对应的标签文本和类型
  if (exist <= 7) {
    return {
      text: '无瑕的漂流瓶',
      type: 'primary'
    };
  } else if (exist <= 30) {
    return {
      text: '完整的漂流瓶',
      type: 'success'
    };
  } else if (exist <= 90) {
    return {
      text: '微瑕的漂流瓶',
      type: 'warning'
    };
  } else if (exist <= 365) {
    return {
      text: '受损的漂流瓶',
      type: 'danger'
    };
  } else {
    return {
      text: '破旧的漂流瓶',
      type: 'info'
    };
  }
}

/**
 * 检查是否应该显示图片上传区域
 * @param {number} fantasy - 幻想类型
 * @returns {boolean} 是否显示图片上传
 */
export function shouldShowImageUpload(fantasy) {
  // 空想(fantasy=0)不显示图片上传，联想(fantasy>1)显示图片上传
  return fantasy !== 0;
}

/**
 * 获取最大文本长度
 * @param {number} fantasy - 幻想类型
 * @returns {number} 最大文本长度
 */
export function getMaxTextLength(fantasy) {
  // 空想(fantasy=0)最多4000字，联想(fantasy>1)最多8000字
  return fantasy === 0 ? 4000 : 8000;
}

export default {
  getCarrierTag,
  getFantasyTag,
  getExistTag,
  shouldShowImageUpload,
  getMaxTextLength
};