<template>
  <div class="monitor-container">
    <h2 class="section-title">
      <el-icon><Monitor /></el-icon>
      系统监控与管理
    </h2>
    
    <div class="monitor-tabs-container">
      <el-tabs v-model="activeTab" class="monitor-tabs" @tab-change="handleTabChange">
        <!-- 服务器详情标签页 -->
        <el-tab-pane label="服务详情" name="server-details">
          <div class="server-details">
            <ServerBasicInfo :server-info="serverData" />
          </div>
        </el-tab-pane>
        
        <!-- 性能监控标签页 -->
        <el-tab-pane label="性能监控" name="performance">
          <PerformanceMonitor 
            :server-data="serverData" 
            @show-gpu-detail="gpuDetailVisible = true" 
          />
        </el-tab-pane>
        
        <!-- 子服务管理标签页 -->
        <el-tab-pane label="服务管理" name="services">
          <ServiceManagement />
        </el-tab-pane>
        
        <!-- 操作记录标签页 -->
        <el-tab-pane label="操作记录" name="operation-logs">
          <OperationLogs />
        </el-tab-pane>
        
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { mockGetServerData, serverData as initialServerData } from '../mock'
import ServerBasicInfo from './ServerBasicInfo.vue'
import ServiceManagement from './ServiceManagement.vue'
import PerformanceMonitor from './PerformanceMonitor.vue'
import OperationLogs from './OperationLogs.vue'

// 服务器数据
const serverData = ref({ ...initialServerData })

// 弹窗控制
const gpuDetailVisible = ref(false)

// 当前激活的标签页
const activeTab = ref('server-details')

// 定时器
let serverDataTimer: any = null

// 获取服务器数据
const fetchServerData = async () => {
  try {
    const res: any = await mockGetServerData()
    serverData.value = res.data
  } catch (error) {
    console.error('获取服务器数据失败', error)
  }
}

// 生命周期钩子
onMounted(() => {
  fetchServerData()
  
  // 定时刷新服务器数据
  serverDataTimer = setInterval(fetchServerData, 5000)
  
  // 添加事件监听器，用于接收从ServiceManagement组件发出的切换请求
  window.addEventListener('switch-to-logs', handleSwitchToLogs)
})

onBeforeUnmount(() => {
  if (serverDataTimer) {
    clearInterval(serverDataTimer)
  }
  
  // 移除事件监听器
  window.removeEventListener('switch-to-logs', handleSwitchToLogs)
})

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  console.log('标签页切换到:', tabName)
  // 可以在这里添加标签页切换时的其他逻辑
}

// 处理切换到操作记录标签页的请求
const handleSwitchToLogs = (event: CustomEvent) => {
  const { serviceId, serviceName } = event.detail
  
  // 切换到操作记录标签页
  activeTab.value = 'operation-logs'
  
  // 可以将服务信息传递给OperationLogs组件
  // 例如通过全局状态管理或事件总线
  console.log(`查看服务 ${serviceName}(ID: ${serviceId}) 的操作记录`)
  
  // 如果OperationLogs组件需要接收这些参数，可以通过事件总线或其他方式传递
  const logEvent = new CustomEvent('filter-operation-logs', {
    detail: { serviceId, serviceName }
  })
  window.dispatchEvent(logEvent)
}
</script>

<style scoped lang="scss">
.monitor-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 8px;
    color: #2080ff;
  }
}

.monitor-tabs-container {
  height: calc(100vh - 120px);
}

.monitor-tabs {
  height: 100%;
  
  :deep(.el-tabs__content) {
    height: calc(100% - 55px);
    overflow-y: auto;
    padding-right: 10px;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.server-details {
  padding-top: 10px;
}

/* 自定义滚动条样式 */
:deep(.el-tabs__content)::-webkit-scrollbar {
  width: 6px;
}

:deep(.el-tabs__content)::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

:deep(.el-tabs__content)::-webkit-scrollbar-track {
  background-color: #f2f6fc;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .monitor-tabs-container {
    height: auto;
  }
  
  .monitor-tabs {
    :deep(.el-tabs__content) {
      height: auto;
      max-height: 800px;
    }
  }
}
</style>