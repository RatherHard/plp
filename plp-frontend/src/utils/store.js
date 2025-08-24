import { reactive } from 'vue'

// 本地存储键名
const STORAGE_KEY = 'bottleContent'
const FIRST_FETCH_KEY = 'firstFetch'
const IF_EDIT_KEY = 'ifEdit'

// 密钥状态键名常量
const KEY_STORAGE_KEY = 'bottleKey'

// 存续时间状态键名常量
const EXIST_STORAGE_KEY = 'bottleExist'

// 网站说明文本
const INSTRUCTIONS_TEXT = [
  '匿名海洋 漂浮着千万种心事——',
  '掷出你的天马行空',
  '捞起陌生星球的回响。',
  '没有账号，不留痕迹，只有此刻的浪花。',
  '天马行空的人可以盯着桌上的物品幻想一个下午。',
  '在这个网站上，幻想爱好者将发布自己的幻想：可以是“空想”，无须以现实为根基，仅用文字编织幻想的乐章；也可以是“联想”，赋予枯燥无味的现实图景名为“幻想”的生命力。',
  '将幻想装入漂流瓶扔出后，经漂流瓶管理局审批通过后，漂流瓶将进入匿名海洋。',
  '其他从匿名海洋中拾起漂流瓶的人可以共同编辑这个幻想。'
]

// 从本地存储加载数据
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    // 如果没有保存的数据，返回 null 让应用使用默认值
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error('从本地存储加载数据失败:', e)
    return null
  }
}

// 添加加载firstFetch状态的函数
const loadFirstFetch = () => {
  try {
    const saved = localStorage.getItem(FIRST_FETCH_KEY)
    // 默认值为0
    return saved ? parseInt(saved, 10) : 0
  } catch (e) {
    console.error('从本地存储加载firstFetch状态失败:', e)
    return 0
  }
}

// 添加加载ifEdit状态的函数
const loadIfEdit = () => {
  try {
    const saved = localStorage.getItem(IF_EDIT_KEY)
    // 默认值为0
    return saved ? parseInt(saved, 10) : 0
  } catch (e) {
    console.error('从本地存储加载ifEdit状态失败:', e)
    return 0
  }
}

// 加载密钥状态
const loadKey = () => {
  try {
    const savedKey = localStorage.getItem(KEY_STORAGE_KEY)
    return savedKey ? JSON.parse(savedKey) : null
  } catch (e) {
    console.error('加载密钥状态失败:', e)
    return null
  }
}

// 加载存续时间状态
const loadExist = () => {
  try {
    const savedExist = localStorage.getItem(EXIST_STORAGE_KEY)
    return savedExist ? parseInt(savedExist, 10) : null
  } catch (e) {
    console.error('加载存续时间状态失败:', e)
    return null
  }
}

// 保存数据到本地存储
const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据到本地存储失败:', e)
  }
}

// 添加保存firstFetch状态的函数
const saveFirstFetch = (value) => {
  try {
    localStorage.setItem(FIRST_FETCH_KEY, String(value))
  } catch (e) {
    console.error('保存firstFetch状态到本地存储失败:', e)
  }
}

// 添加保存ifEdit状态的函数
const saveIfEdit = (value) => {
  try {
    localStorage.setItem(IF_EDIT_KEY, String(value))
  } catch (e) {
    console.error('保存ifEdit状态到本地存储失败:', e)
  }
}

// 保存密钥状态
const saveKey = (key) => {
  try {
    localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(key))
  } catch (e) {
    console.error('保存密钥状态失败:', e)
  }
}

// 保存存续时间状态
const saveExist = (exist) => {
  try {
    localStorage.setItem(EXIST_STORAGE_KEY, String(exist))
  } catch (e) {
    console.error('保存存续时间状态失败:', e)
  }
}

// 创建共享状态
const state = reactive({
  bottleContent: loadFromStorage() || {
    id: null, // 添加id字段，默认为null
    title: '',
    text: '这是用户编辑的文本内容，可以不是很长的一段文字，描述着某个人的故事或者想法。\n在这个快节奏的世界里，我们有时候需要一个安静的角落来表达自己的内心。漂流瓶就是一个这样的地方，你可以把你想说的话写下来，然后扔出去，让它在虚拟的世界里漂流。',
    images: [],
    carrier: 0, // 默认为牛皮纸
    fantasy: 1, // 默认为联想
    source: 0,  // 默认为自行编辑(0)而不是来自他人(1)
    uploadTime: null // 添加上传时间字段
  },
  firstFetch: loadFirstFetch(), // 添加firstFetch状态
  ifEdit: loadIfEdit(), // 添加ifEdit状态
  key: loadKey() || null,
  exist: loadExist() || null // 添加存续时间状态
})

// 创建 store 对象
const store = {
  state,
  
  // 获取内容
  getContent() {
    return this.state.bottleContent
  },
  
  // 获取显示的标题（如果title为空则返回默认标题）
  getDisplayTitle() {
    return this.state.bottleContent.title || '漂流瓶内容'
  },
  
  // 获取实际的标题（用于编辑）
  getActualTitle() {
    return this.state.bottleContent.title
  },
  
  // 获取来源信息
  getSource() {
    return this.state.bottleContent.source || 0
  },
  
  // 获取网站说明文本
  getInstructionsText() {
    return INSTRUCTIONS_TEXT
  },
  
  // 更新内容（包括标题和文字）
  updateContent(newContent) {
    // 完全替换而不是合并
    this.state.bottleContent = {
      id: null,
      title: '',
      text: '这是用户编辑的文本内容，可以不是很长的一段文字，描述着某个人的故事或者想法。\n在这个快节奏的世界里，我们有时候需要一个安静的角落来表达自己的内心。漂流瓶就是一个这样的地方，你可以把你想说的话写下来，然后扔出去，让它在虚拟的世界里漂流。',
      images: [],
      carrier: 0,
      fantasy: 1,
      source: 0,
      uploadTime: null,
      ...newContent  // 使用展开运算符应用新内容，确保新内容覆盖默认值
    };
    saveToStorage(this.state.bottleContent);
  },
  
  // 更新文本内容
  updateText(text) {
    this.state.bottleContent.text = text
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新标题
  updateTitle(title) {
    this.state.bottleContent.title = title
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新载体类型
  updateCarrier(carrier) {
    this.state.bottleContent.carrier = carrier
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新幻想类型
  updateFantasy(fantasy) {
    this.state.bottleContent.fantasy = fantasy
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新上传时间
  updateUploadTime(uploadTime) {
    this.state.bottleContent.uploadTime = uploadTime
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新ID
  updateId(id) {
    this.state.bottleContent.id = id
    saveToStorage(this.state.bottleContent)
  },
  
  // 更新来源信息
  updateSource(source) {
    this.state.bottleContent.source = source
    saveToStorage(this.state.bottleContent)
  },
  
  // 添加更新firstFetch状态的方法
  updateFirstFetch(value) {
    this.state.firstFetch = value
    saveFirstFetch(value)
  },
  
  // 获取firstFetch状态
  getFirstFetch() {
    return this.state.firstFetch
  },
  
  // 添加更新ifEdit状态的方法
  updateIfEdit(value) {
    this.state.ifEdit = value
    saveIfEdit(value)
  },
  
  // 获取ifEdit状态
  getIfEdit() {
    return this.state.ifEdit
  },
  
  // 获取ID
  getId() {
    return this.state.bottleContent.id
  },
  
  // 更新图片内容
  updateImages(images) {
    this.state.bottleContent.images = images
    saveToStorage(this.state.bottleContent)
  },
  
  // 添加图片
  addImage(image) {
    this.state.bottleContent.images.push(image)
    saveToStorage(this.state.bottleContent)
  },
  
  // 移除图片
  removeImage(image) {
    const index = this.state.bottleContent.images.indexOf(image)
    if (index > -1) {
      this.state.bottleContent.images.splice(index, 1)
      saveToStorage(this.state.bottleContent)
    }
  },
  
  // 设置图片列表
  setImages(images) {
    this.state.bottleContent.images = images
    saveToStorage(this.state.bottleContent)
  },
  
  // 清空所有图片
  clearImages() {
    this.state.bottleContent.images = []
    saveToStorage(this.state.bottleContent)
  },
  
  // 清空所有内容
  clearAll() {
    this.state.bottleContent = {
      id: null,
      title: '',
      text: '这是用户编辑的文本内容，可以不是很长的一段文字，描述着某个人的故事或者想法。\n在这个快节奏的世界里，我们有时候需要一个安静的角落来表达自己的内心。漂流瓶就是一个这样的地方，你可以把你想说的话写下来，然后扔出去，让它在虚拟的世界里漂流。',
      images: [],
      carrier: 0,
      fantasy: 1,
      source: 0,
      uploadTime: null
    }
    this.state.ifEdit = 0
    this.state.key = null
    this.state.exist = null
    
    saveToStorage(this.state.bottleContent)
    saveFirstFetch(this.state.firstFetch)
    saveIfEdit(this.state.ifEdit)
    saveKey(this.state.key)
    saveExist(this.state.exist)
  },
  
  // 彻底清除本地存储的数据
  clearLocalStorage() {
    try {
      // 移除主存储键
      localStorage.removeItem(STORAGE_KEY)
      
      // 清除所有可能相关的存储项（防止有其他地方也存储了相关数据）
      for (let key in localStorage) {
        if (key.includes('bottle') || key.includes('content')) {
          localStorage.removeItem(key)
        }
      }
      
      // 重新加载页面以确保状态完全重置
      // 注意：这行代码可根据需要启用或禁用
      // window.location.reload()
    } catch (e) {
      console.error('清除本地存储失败:', e)
    }
  },
  
  // 获取密钥
  getKey() {
    return this.state.key
  },
  
  // 更新密钥
  updateKey(key) {
    this.state.key = key
    saveKey(key)
  },
  
  // 清除密钥
  clearKey() {
    this.state.key = null
    localStorage.removeItem(KEY_STORAGE_KEY)
  },
  
  // 获取存续时间
  getExist() {
    return this.state.exist
  },
  
  // 更新存续时间
  updateExist(exist) {
    this.state.exist = exist
    saveExist(exist)
  },
  
  // 清除存续时间
  clearExist() {
    this.state.exist = null
    localStorage.removeItem(EXIST_STORAGE_KEY)
  }
}

export default store