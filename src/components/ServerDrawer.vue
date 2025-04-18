<template>
  <el-drawer
    v-model="drawerVisibleComputed"
    :title="title"
    :size="size"
    :direction="direction"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <div class="server-drawer-content">
      <div class="server-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="服务名称">{{ currentService?.name }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentService?.ip }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ currentService?.port }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="log-section">
        <div class="log-header">
          <h3 class="log-title">执行日志</h3>
          <el-button type="primary" size="small" class="view-log-btn" @click="handleViewLog">查看日志</el-button>
        </div>
        <div class="log-container">
          <div v-for="(log, index) in serviceLogs" :key="index" class="log-item" :class="log.type">
            [{{ log.time }}] {{ log.message }}
          </div>
          <div class="log-actions">
            <el-button type="primary" size="small" icon="el-icon-document-copy" @click="copyAllLogs">复制全部</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 添加 router
const router = useRouter()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '服务器信息'
  },
  size: {
    type: [String, Number],
    default: '30%'
  },
  direction: {
    type: String,
    default: 'rtl'
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  currentService: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'close'])

const drawerVisibleComputed = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 日志相关逻辑
const serviceLogs = ref<Array<{time: string, message: string, type: string}>>([])

// 生成时间戳
const getTimeStamp = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour12: false })
}

// 模拟服务启动日志
const simulateServiceLogs = () => {
  serviceLogs.value = []
  
  // 清空日志并添加初始日志
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: '正在初始化服务...', type: 'info' })
  }, 100)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: `正在连接服务器 ${props.currentService?.ip}:${props.currentService?.port}...`, type: 'info' })
  }, 800)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: '服务器连接成功', type: 'success' })
  }, 1500)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: `正在启动服务 ${props.currentService?.name}...`, type: 'info' })
  }, 2200)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: '服务依赖项检查中...', type: 'info' })
  }, 3000)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: '依赖项检查完成', type: 'success' })
  }, 3800)
  
  setTimeout(() => {
    serviceLogs.value.push({ time: getTimeStamp(), message: '服务执行成功', type: 'success' })
  }, 4500)
}

// 当抽屉打开时模拟日志
watch(() => props.visible, (newVal) => {
  if (newVal && props.currentService) {
    simulateServiceLogs()
  }
})

const handleClose = () => {
  emit('close')
}

// 处理查看日志按钮点击事件
const handleViewLog = () => {
  // 关闭当前抽屉
  drawerVisibleComputed.value = false
   // 发送事件通知父组件切换到操作记录页面
   const event = new CustomEvent('switch-to-logs', { 
    detail: { 
      serviceId: 1,
      serviceName: "web服务",
      switchToTab: 'operation-logs'
    } 
  })
  window.dispatchEvent(event)
}

// 复制全部日志
const copyAllLogs = () => {
  if (serviceLogs.value.length === 0) {
    ElMessage.info('暂无日志可复制')
    return
  }
  
  const logText = serviceLogs.value.map(log => `[${log.time}] ${log.message}`).join('\n')
  
  navigator.clipboard.writeText(logText)
    .then(() => {
      ElMessage.success('日志已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败，请重试')
    })
}
</script>

<style scoped lang="scss">
.server-drawer-content {
  padding: 1px;
}

.server-info {
  margin-bottom: 20px;
  
  h3 {
    font-size: 16px;
    margin-bottom: 15px;
    color: #303133;
    font-weight: 500;
  }
}

.log-section {
  margin-top: 10px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.log-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 0;
}

.view-log-btn {
  margin-left: 10px;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #f0f0f0;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  position: relative;
}

.log-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  background-color: rgba(30, 30, 30, 0.8);
  padding: 5px;
  border-radius: 4px;
}

.log-item {
  margin-bottom: 5px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  
  &.info {
    color: #8cc0ff;
  }
  
  &.success {
    color: #67c23a;
  }
  
  &.warning {
    color: #e6a23c;
  }
  
  &.error {
    color: #f56c6c;
  }
}
</style>