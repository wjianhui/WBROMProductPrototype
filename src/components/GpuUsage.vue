<template>
  <div class="metric-item gpu-usage">
    <div class="metric-header">
      <span class="metric-title">GPU使用率</span>
    </div>
    
    <div v-if="displayData.gpus && displayData.gpus.length > 0" class="gpu-cards">
      <!-- 以卡片形式展示所有GPU -->
      <div v-for="(gpu, index) in displayData.gpus" :key="index" class="gpu-card">
        <div class="gpu-name">GPU: {{ gpu.model }}</div>
        <div class="gpu-usage-container">
          <el-progress 
            :percentage="gpu.usage" 
            :color="getGpuColor(gpu.usage)"
            :stroke-width="10"
            :show-text="false"
            class="gpu-progress"
          />
          <div class="usage-memory-container">
            <div class="usage-value" :style="{color: getGpuColor(gpu.usage)}">{{ gpu.usage }}%</div>
            <div class="memory-info">显存: {{ gpu.memory.used }}GB / {{ gpu.memory.total }}GB</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 兼容单GPU情况的备用显示 -->
    <div v-else class="gpu-cards">
      <div class="gpu-card">
        <div class="gpu-name">GPU: {{ displayData.gpu.model }}</div>
        <div class="gpu-usage-container">
          <el-progress 
            :percentage="displayData.gpu.usage" 
            :color="getGpuColor(displayData.gpu.usage)"
            :stroke-width="10"
            :show-text="false"
            class="gpu-progress"
          />
          <div class="usage-memory-container">
            <div class="usage-value" :style="{color: getGpuColor(displayData.gpu.usage)}">{{ displayData.gpu.usage }}%</div>
            <div class="memory-info">显存: {{ displayData.gpu.memory.used }}GB / {{ displayData.gpu.memory.total }}GB</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'


const gpuMData = {
  gpus: [
  {
          model: 'NVIDIA RTX 4090',
          usage: 45,
          memory: {
            used: 8.5,
            total: 24
          }
        },
        {
          model: 'NVIDIA RTX 3060',
          usage: 65,
          memory: {
            used: 5.3,
            total: 12
          }
        },
        {
          model: 'NVIDIA Tesla V100',
          usage: 88,
          memory: {
            used: 14.2,
            total: 16
          }
        }
  ]
}

// 使用计算属性确保我们始终使用默认数据
const displayData = computed(() => {
  // 如果传入的数据为空或没有gpus属性，则使用默认数据
  // if (!props.gpuData || (!props.gpuData.gpus && !props.gpuData.gpu)) {
  //   return props.gpuData.default();
  // }
  return gpuMData;
})

defineEmits(['showDetail'])

// 获取GPU颜色
const getGpuColor = (usage: number) => {
  if (usage <= 60) return '#67c23a'
  if (usage <= 80) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped lang="scss">
.gpu-usage {
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f5f7fa;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .metric-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .gpu-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
  }
  
  .gpu-card {
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
    }
    
    .gpu-name {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin-bottom: 10px;
    }
    
    .gpu-usage-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .usage-memory-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .usage-value {
        font-size: 16px;
        font-weight: 500;
      }
      
      .gpu-progress {
        width: 100%;
        
        :deep(.el-progress-bar__outer) {
          border-radius: 4px;
          background-color: #f0f2f5;
          height: 12px !important;
        }
        
        :deep(.el-progress-bar__inner) {
          border-radius: 4px;
          transition: width 0.6s ease;
        }
      }
      
      .memory-info {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>