<template>
  <div class="edit-container">
    <HeaderComponent/>
    
    <VideoBackground />
    
    <main class="main-content">
      <div class="content-layout">
        <el-row :gutter="20">
          <el-col :span="24">
            <BottleEditor
              v-model="contentCopy"
              :show-image-upload="!!showImageUpload"
              :max-text-length="maxTextLength"
              :disable-image-actions="disableImageActions"
              :carrier-tag="carrierTag"
              :fantasy-tag="fantasyTag"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </el-col>
        </el-row>
      </div>
    </main>
    
    <FooterComponent />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import HeaderComponent from '../components/Header.vue'
import FooterComponent from '../components/Footer.vue'
import VideoBackground from '../components/VideoBackground.vue'
import BottleEditor from '../components/BottleEditor.vue'
import store from '../utils/store'
import { 
  getCarrierTag, 
  getFantasyTag, 
  shouldShowImageUpload, 
  getMaxTextLength 
} from '../utils/bottle'

export default {
  name: 'Edit',
  components: {
    HeaderComponent,
    FooterComponent,
    VideoBackground,
    BottleEditor
  },
  setup() {
    const router = useRouter()
    
    // 计算载体标签显示内容
    const carrierTag = computed(() => {
      try {
        const content = store.getContent();
        const carrier = content && content.carrier !== undefined ? content.carrier : 0;
        return getCarrierTag(carrier);
      } catch (e) {
        // 出现错误时返回默认值
        return getCarrierTag(0);
      }
    })
    
    // 计算幻想类型标签显示内容
    const fantasyTag = computed(() => {
      try {
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
        return getFantasyTag(fantasy);
      } catch (e) {
        // 出现错误时返回默认值
        return getFantasyTag(0);
      }
    })
    
    // 根据幻想类型判断是否显示图片上传功能
    const showImageUpload = computed(() => {
      try {
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
        // 使用工具函数判断是否显示图片上传
        return shouldShowImageUpload(fantasy);
      } catch (e) {
        // 默认显示图片上传功能（联想）
        return true;
      }
    })
    
    // 根据幻想类型获取文本最大字数
    const maxTextLength = computed(() => {
      try {
        const content = store.getContent();
        const fantasy = content && content.fantasy !== undefined ? content.fantasy : 0;
        // 使用工具函数获取最大文本长度
        return getMaxTextLength(fantasy);
      } catch (e) {
        // 默认为联想的字数限制
        return getMaxTextLength(1);
      }
    })
    
    // 当source为1时禁用图片上传和删除功能
    const disableImageActions = computed(() => {
      try {
        const source = store.getSource();
        return source === 1;
      } catch (e) {
        return false;
      }
    })
    
    // 保存原始内容用于比较
    const originalContent = JSON.parse(JSON.stringify(store.getContent()))
    
    // 创建内容副本用于编辑
    const contentCopy = ref(JSON.parse(JSON.stringify(store.getContent())))
    
    // 初始化文件列表
    onMounted(() => {
      // 检查是否为永恒纸（carrier=1）且来源为编辑（source=1）
      const content = store.getContent();
      const carrier = content && content.carrier !== undefined ? content.carrier : 0;
      const source = store.getSource();
      
      if (carrier === 1 && source === 1) {
        // 清空所有数据和共享状态
        store.clearAll();
        
        // 弹出警告
        ElMessageBox.alert(
          '不可修改永恒纸上的内容',
          '警告',
          {
            confirmButtonText: '确定',
            type: 'warning',
            callback: () => {
              // 回退到首页
              router.push('/');
            }
          }
        );
        return;
      }
    })
    
    // 保存内容处理函数
    const handleSave = (content) => {
      // 使用content完全覆盖共享状态
      store.updateContent(content);
      
      // 检查内容是否被修改（标题、正文或图片）
      const isTitleChanged = originalContent.title !== content.title;
      const isTextChanged = originalContent.text !== content.text;
      const isImagesChanged = JSON.stringify(originalContent.images) !== JSON.stringify(content.images);
      
      // 根据内容是否被修改来设置ifEdit状态
      if (isTitleChanged || isTextChanged || isImagesChanged) {
        // 内容被修改，设置ifEdit为1
        store.updateIfEdit(1);
      } else {
        // 内容未被修改，设置ifEdit为0
        store.updateIfEdit(0);
      }
      
      // 保存内容逻辑（现在由store自动处理本地存储）
      ElMessage.success('内容已保存!')
      router.push('/view')
    }
    
    // 取消编辑处理函数
    const handleCancel = () => {
      router.go(-1)
    }
    
    return {
      contentCopy,
      carrierTag,
      fantasyTag,
      showImageUpload,
      maxTextLength,
      disableImageActions,
      handleSave,
      handleCancel
    }
  }
}
</script>

<style scoped>
.edit-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.main-content {
  position: relative;
  top: 85px;
  height: calc(100vh - 160px);
  padding: 80px 20px 50px;
  overflow-y: auto;
}

.content-layout {
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 20px;
}
</style>