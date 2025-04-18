<template>
  <section class="services-section">
    <div class="services-toolbar">
      <!-- 左侧可以放置其他元素 -->
      <div></div>
      
      <div class="batch-actions">
        <el-button 
          type="danger" 
          :disabled="batchLoading" 
          @click="handleShutdownAll"
        >
          一键关机
        </el-button>
        <el-button 
          type="primary" 
          :disabled="selectedServices.length === 0 || batchLoading" 
          @click="handleBatchRestart"
        >
          <el-icon><RefreshRight /></el-icon>
          批量重启
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedServices.length === 0 || batchLoading" 
          @click="handleBatchStop"
        >
          <el-icon><CircleClose /></el-icon>
          批量停止
        </el-button>
      </div>
    </div>
    
    <el-table 
      :data="services" 
      style="width: 100%" 
      @selection-change="handleSelectionChange"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      :row-class-name="tableRowClassName"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="服务名称" min-width="180" />
      <el-table-column prop="ip" label="服务IP" min-width="140" />
      <el-table-column prop="port" label="端口号" min-width="100" />
      <el-table-column label="状态" min-width="120">
        <template #default="scope">
          <div class="service-status">
            <span 
              class="status-indicator" 
              :class="scope.row.status === 'running' ? 'running' : 'stopped'"
            ></span>
            <span>{{ scope.row.status === 'running' ? '运行中' : '已停止' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            :loading="scope.row.restarting" 
            :disabled="scope.row.stopping"
            @click="handleRestart(scope.row)"
          >
            <el-icon><RefreshRight /></el-icon>
            {{ scope.row.restarting ? '重启中...' : '重启' }}
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            :loading="scope.row.stopping" 
            :disabled="scope.row.restarting || scope.row.status === 'stopped'"
            @click="handleStop(scope.row)"
          >
            <el-icon><CircleClose /></el-icon>
            {{ scope.row.stopping ? '停止中...' : '停止' }}
          </el-button>
          <!-- 新增日志按钮 -->
          <el-button 
            type="info" 
            size="small" 
            @click="handleViewLogs(scope.row)"
          >
            <el-icon><Document /></el-icon>
            日志
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加ServerDrawer组件 -->
    <ServerDrawer
      v-model:visible="drawerVisible"
      title="服务器信息"
      size="40%"
      @close="handleDrawerClose"
      :current-service="currentService"
    >
    </ServerDrawer>

    <!-- 使用公共确认对话框组件 -->
    <ConfirmDialog
      v-model:visible="confirmDialogVisible"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-text="confirmDialogConfirmText"
      :placeholder="confirmDialogPlaceholder"
      @confirm="handleConfirmDialogConfirm"
      @cancel="handleConfirmDialogCancel"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Connection, RefreshRight, CircleClose, Close,
  SuccessFilled, CircleCloseFilled, Document 
} from '@element-plus/icons-vue'
import { 
  mockGetServices, mockOperateService, 
  mockBatchOperateServices, services as initialServices 
} from '../mock'
import ServerDrawer from './ServerDrawer.vue' // 引入ServerDrawer组件
import ConfirmDialog from './ConfirmDialog.vue' // 引入确认对话框组件


// 子服务列表
const services = ref(initialServices.map(service => ({
  ...service,
  restarting: false,
  stopping: false
})))

// 选中的服务
const selectedServices = ref<any[]>([])
const selectAll = ref(false)

// 日志相关
interface LogItem {
  time: string;
  content: string;
  type: 'info' | 'success' | 'error' | 'warning';
}


const singleOperationLogs = ref<LogItem[]>([])

// 单个服务操作相关
const operationCompleted = ref(false)
const operationSuccess = ref(false)
const currentService = ref<any>(null)
const currentOperation = ref<'restart' | 'stop'>('restart')

// 批量操作相关
const batchLoading = ref(false)

// 获取服务列表
const fetchServices = async () => {
  try {
    const res: any = await mockGetServices()
    services.value = res.data.map((service: any) => ({
      ...service,
      restarting: false,
      stopping: false
    }))
  } catch (error) {
    console.error('获取服务列表失败', error)
  }
}

// 表格行样式
const tableRowClassName = ({ row }: any) => {
  return row.status === 'stopped' ? 'service-stopped-row' : ''
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedServices.value = selection
  selectAll.value = selection.length === services.value.length
}

// 处理全选变化
const handleSelectAllChange = (val: boolean) => {
  if (val) {
    services.value.forEach(row => {
      (document.querySelector('.el-table') as any).toggleRowSelection(row, true)
    })
  } else {
    (document.querySelector('.el-table') as any).clearSelection()
  }
}

// 模拟执行过程
const simulateOperation = async (serviceName: string, operation: 'restart' | 'stop', isBatch = false) => {
  const steps = operation === 'restart' 
    ? [
        { content: `正在连接到服务 ${serviceName}...`, delay: 500 },
        { content: `正在检查服务 ${serviceName} 状态...`, delay: 700 },
        { content: `准备${operation === 'restart' ? '重启' : '停止'}服务 ${serviceName}...`, delay: 600 },
        { content: `正在${operation === 'restart' ? '停止' : '停止'}服务 ${serviceName}...`, delay: 1000 },
        { content: operation === 'restart' ? `服务 ${serviceName} 已停止，正在重新启动...` : `服务 ${serviceName} 正在停止...`, delay: 1200 },
        { content: operation === 'restart' ? `正在初始化服务 ${serviceName}...` : `正在关闭服务 ${serviceName} 相关进程...`, delay: 800 },
        { content: operation === 'restart' ? `服务 ${serviceName} 启动中...` : `服务 ${serviceName} 即将停止...`, delay: 900 },
        { content: `${operation === 'restart' ? '重启' : '停止'}服务 ${serviceName} 成功`, delay: 500, type: 'success' as const }
      ]
    : [
        { content: `正在连接到服务 ${serviceName}...`, delay: 500 },
        { content: `正在检查服务 ${serviceName} 状态...`, delay: 700 },
        { content: `准备停止服务 ${serviceName}...`, delay: 600 },
        { content: `正在停止服务 ${serviceName}...`, delay: 1000 },
        { content: `正在关闭服务 ${serviceName} 相关进程...`, delay: 800 },
        { content: `服务 ${serviceName} 即将停止...`, delay: 900 },
        { content: `停止服务 ${serviceName} 成功`, delay: 500, type: 'success' as const }
      ]
  
 
}

// 重启服务
const handleRestart = async (service: any) => {
  // 设置确认对话框参数
  currentService.value = service
  confirmDialogTitle.value = '重启确认'
  confirmDialogMessage.value = `确定要重启 ${service.name} 服务吗？请输入"重启"以确认操作：`
  confirmDialogConfirmText.value = '重启'
  confirmDialogPlaceholder.value = '请输入"重启"'
  
  // 设置确认回调
  confirmDialogCallback.value = () => {
    // 显示抽屉组件
    drawerVisible.value = true
    
    service.restarting = true
    currentOperation.value = 'restart'
    operationCompleted.value = false
    operationSuccess.value = false
    singleOperationLogs.value = []
    
    try {
      // 在单独的异步函数中执行模拟过程，确保UI能够实时更新
      setTimeout(async () => {
        try {
          // 模拟执行过程
          await simulateOperation(service.name, 'restart', false)
          
          // 实际API调用
          await mockOperateService(service.id, 'restart')
          
          operationSuccess.value = true
          service.status = 'running'
        } catch (error: any) {
          operationSuccess.value = false
        } finally {
          service.restarting = false
          operationCompleted.value = true
        }
      }, 0)
    } catch (error: any) {
      service.restarting = false
      operationCompleted.value = true
      operationSuccess.value = false
    }
  }
  
  // 显示确认对话框
  confirmDialogVisible.value = true
}

// 停止服务
const handleStop = async (service: any) => {
  // 设置确认对话框参数
  currentService.value = service
  confirmDialogTitle.value = '停止确认'
  confirmDialogMessage.value = `确定要停止 ${service.name} 服务吗？请输入"停止"以确认操作：`
  confirmDialogConfirmText.value = '停止'
  confirmDialogPlaceholder.value = '请输入"停止"'
  
  // 设置确认回调
  confirmDialogCallback.value = () => {
    // 显示抽屉组件
    drawerVisible.value = true
    
    service.stopping = true
    currentOperation.value = 'stop'
    operationCompleted.value = false
    operationSuccess.value = false
    singleOperationLogs.value = []
    
    try {
      // 在单独的异步函数中执行模拟过程，确保UI能够实时更新
      setTimeout(async () => {
        try {
          // 模拟执行过程
          await simulateOperation(service.name, 'stop', false)
          
          // 实际API调用
          await mockOperateService(service.id, 'stop')
          
          operationSuccess.value = true
          service.status = 'stopped'
        } catch (error: any) {
          operationSuccess.value = false
        } finally {
          service.stopping = false
          operationCompleted.value = true
        }
      }, 0)
    } catch (error: any) {
      service.stopping = false
      operationCompleted.value = true
      operationSuccess.value = false
    }
  }
  
  // 显示确认对话框
  confirmDialogVisible.value = true
}

// 批量重启
const handleBatchRestart = async () => {
  if (selectedServices.value.length === 0) return
  
  // 设置确认对话框参数
  confirmDialogTitle.value = '批量重启'
  confirmDialogMessage.value = `确定要重启选中的 ${selectedServices.value.length} 个服务吗？请输入"批量重启"以确认操作：`
  confirmDialogConfirmText.value = '批量重启'
  confirmDialogPlaceholder.value = '请输入"批量重启"'
  
  // 设置确认回调
  confirmDialogCallback.value = () => {
    // 显示抽屉组件
    drawerVisible.value = true
    // 这里添加批量重启的逻辑
  }
  
  // 显示确认对话框
  confirmDialogVisible.value = true
}

// 批量停止
const handleBatchStop = async () => {
  if (selectedServices.value.length === 0) return
  
  // 设置确认对话框参数
  confirmDialogTitle.value = '批量停止'
  confirmDialogMessage.value = `确定要停止选中的 ${selectedServices.value.length} 个服务吗？请输入"批量停止"以确认操作：`
  confirmDialogConfirmText.value = '批量停止'
  confirmDialogPlaceholder.value = '请输入"批量停止"'
  
  // 设置确认回调
  confirmDialogCallback.value = () => {
    // 显示抽屉组件
    drawerVisible.value = true
    // 这里添加批量停止的逻辑
  }
  
  // 显示确认对话框
  confirmDialogVisible.value = true
}

// 处理确认对话框确认
const handleConfirmDialogConfirm = () => {
  if (confirmDialogCallback.value) {
    confirmDialogCallback.value()
  }
}

// 处理确认对话框取消
const handleConfirmDialogCancel = () => {
  // 用户取消操作，不需要做任何事情
}



// 根据ID获取服务名称
const getServiceNameById = (id: number) => {
  const service = services.value.find(s => s.id === id)
  return service ? service.name : `未知服务(ID: ${id})`
}

// 生命周期钩子
onMounted(() => {
  fetchServices()
})

// 添加抽屉控制变量
const drawerVisible = ref(false)

// 添加确认对话框相关变量
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogConfirmText = ref('')
const confirmDialogPlaceholder = ref('')
const confirmDialogCallback = ref<(() => void) | null>(null)

// 处理抽屉关闭
const handleDrawerClose = () => {
  drawerVisible.value = false
}
// 一键关机
const handleShutdownAll = async () => {
  // 设置确认对话框参数
  confirmDialogTitle.value = '一键关机'
  confirmDialogMessage.value = `确定要关闭所有服务吗？此操作将停止所有运行中的服务。请输入"关机"以确认操作：`
  confirmDialogConfirmText.value = '关机'
  confirmDialogPlaceholder.value = '请输入"关机"'
  
  // 设置确认回调
  confirmDialogCallback.value = () => {
    // 显示抽屉组件
    drawerVisible.value = true
    
    // 获取所有运行中的服务
    const runningServices = services.value.filter(service => service.status === 'running')
    
    if (runningServices.length === 0) {
      ElMessage.info('当前没有运行中的服务')
      return
    }
    
    batchLoading.value = true
    currentOperation.value = 'stop'
    operationCompleted.value = false
    operationSuccess.value = false
    
    // 这里添加关闭所有服务的逻辑
    // 可以调用批量操作API或者循环调用单个服务的停止API
    
    // 模拟操作完成
    setTimeout(() => {
      // 更新所有服务状态为已停止
      runningServices.forEach(service => {
        service.status = 'stopped'
      })
      
      batchLoading.value = false
      operationCompleted.value = true
      operationSuccess.value = true
      
      ElMessage.success('所有服务已关闭')
    }, 3000)
  }
  
  // 显示确认对话框
  confirmDialogVisible.value = true
}
// 处理查看日志
const handleViewLogs = (service: any) => {
  // 发送事件通知父组件切换到操作记录页面
  const event = new CustomEvent('switch-to-logs', { 
    detail: { 
      serviceId: service.id,
      serviceName: service.name,
      switchToTab: 'operation-logs'
    } 
  })
  window.dispatchEvent(event)
}
</script>

<style scoped lang="scss">
.services-section {
  padding: 20px;
  flex: 1;
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

.services-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .batch-actions {
    display: flex;
    gap: 10px;
  }
}

.service-status {
  display: flex;
  align-items: center;
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    
    &.running {
      background-color: #67c23a;
      box-shadow: 0 0 5px #67c23a;
    }
    
    &.stopped {
      background-color: #f56c6c;
      box-shadow: 0 0 5px #f56c6c;
    }
  }
}

.service-stopped-row {
  background-color: rgba(245, 108, 108, 0.05);
}

.operation-logs {
  margin-top: 15px;
  
  h4 {
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
  
  .log-container {
    height: 200px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f7fa;
    font-family: monospace;
    font-size: 12px;
    
    .log-item {
      margin-bottom: 5px;
      line-height: 1.5;
      
      .log-time {
        color: #909399;
        margin-right: 5px;
      }
      
      &.info .log-content {
        color: #606266;
      }
      
      &.success .log-content {
        color: #67c23a;
      }
      
      &.error .log-content {
        color: #f56c6c;
      }
      
      &.warning .log-content {
        color: #e6a23c;
      }
    }
  }
}

.operation-status {
  margin-bottom: 15px;
}

.batch-result {
  margin-top: 20px;
  
  .result-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    
    .success-count {
      color: #67c23a;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 5px;
      }
    }
    
    .failed-count {
      color: #f56c6c;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 5px;
      }
    }
  }
  
  .failed-services {
    margin-bottom: 15px;
    
    h4 {
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        color: #f56c6c;
        margin-bottom: 5px;
      }
    }
  }
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style>