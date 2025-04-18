<template>
  <div class="metric-item server-info-card">
    <div class="metric-label">服务器信息</div>
    <div class="server-info-content">
      <div class="info-row">
        <span class="info-label">服务器IP:</span>
        <div class="info-value ip-address" @click="copyIP">
          {{ serverInfo.ip }}
          <el-tooltip content="点击复制IP地址" placement="top">
            <el-icon><CopyDocument /></el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="info-row">
        <span class="info-label">设备序列号:</span>
        <div class="info-value ip-address" @click="copySerialNumber">
          {{ serverInfo.serialNumber }}
          <el-tooltip content="点击复制设备序列号" placement="top">
            <el-icon><CopyDocument /></el-icon>
          </el-tooltip>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  serverInfo: {
    type: Object,
    required: true
  }
})

// 复制IP地址
const copyIP = () => {
  navigator.clipboard.writeText(props.serverInfo.ip)
    .then(() => {
      ElMessage.success('IP地址已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 复制设备序列号
const copySerialNumber = () => {
  navigator.clipboard.writeText(props.serverInfo.serialNumber)
    .then(() => {
      ElMessage.success('设备序列号已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}
</script>

<style scoped lang="scss">
.metric-item {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9fafc;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  
  .metric-label {
    font-size: 16px;
    color: #606266;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }
  
  .server-info-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    
    .info-label {
      font-size: 14px;
      color: #909399;
      width: 90px;
      flex-shrink: 0;
    }
    
    .info-value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
    
    .ip-address {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .el-icon {
        margin-left: 8px;
        color: #2080ff;
      }
      
      &:hover {
        color: #2080ff;
      }
    }
  }
}
</style>