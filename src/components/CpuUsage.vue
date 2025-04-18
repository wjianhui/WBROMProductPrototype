<template>
  <div class="metric-item cpu-usage">
    <!-- 顶部标题区 -->
    <div class="metric-header">
      <div class="metric-title">CPU使用率</div>
    </div>

    <!-- CPU卡片容器 -->
    <div class="cpu-cards-container">
      <!-- 主CPU卡片 -->
      <div class="cpu-card main-cpu-card">
        <div class="cpu-card-info">
          <span>{{ cpuData.cores }}核 {{ cpuData.model }}</span>
        </div>
        <el-progress 
          :percentage="cpuData.usage" 
          :color="getCpuColor(cpuData.usage)"
          :stroke-width="10"
          :show-text="false"
        />
        <div class="cpu-card-stats">
          <span class="usage-value" :style="{color: getCpuColor(cpuData.usage)}">{{ cpuData.usage }}%</span>
          <span class="cpu-card-detail">总核心数: {{ cpuData.cores }}</span>
        </div>
      </div>
      
      <!-- 其他CPU卡片 -->
      <div v-for="(cpu, index) in cpuList" :key="index" class="cpu-card">
        <div class="cpu-card-info">
          <span>{{ cpu.cores }}核 {{ cpu.model }}</span>
        </div>
        <el-progress 
          :percentage="cpu.usage" 
          :color="getCpuColor(cpu.usage)"
          :stroke-width="10"
          :show-text="false"
        />
        <div class="cpu-card-stats">
          <span class="usage-value" :style="{color: getCpuColor(cpu.usage)}">{{ cpu.usage }}%</span>
          <span class="cpu-card-detail">总核心数: {{ cpu.cores }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  cpuData: {
    type: Object,
    required: true
  }
})

// 模拟多个CPU数据
const cpuList = ref([
  {
    id: 1,
    model: 'Intel Xeon E5-2680 v4',
    usage: 49.2,
    cores: 8
  },
  {
    id: 2,
    model: 'Intel Xeon E5-2680 v4',
    usage: 49.2,
    cores: 8
  },
  {
    id: 3,
    model: 'Intel Xeon E5-2680 v4',
    usage: 49.2,
    cores: 8
  }
])

// 获取CPU颜色
const getCpuColor = (usage: number) => {
  if (usage <= 60) return '#67c23a'
  if (usage <= 80) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped lang="scss">
.cpu-usage {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9fafc;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    
    .metric-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .cpu-cards-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
    
    .cpu-card {
      background-color: #fff;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #ebeef5;
      
      &.main-cpu-card {
        background-color: #f0f9eb;
        border-color: #c2e7b0;
      }
      
      .cpu-card-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
      }
      
      .cpu-card-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        
        .usage-value {
          font-weight: 500;
          font-size: 14px;
        }
        
        .cpu-card-detail {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
