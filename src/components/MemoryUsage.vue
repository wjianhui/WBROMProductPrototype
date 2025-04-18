<template>
  <div class="memory-component">
    <!-- 顶部标题区 -->
    <div class="section-header">
      <div class="section-title">内存使用率</div>
    </div>
    
    <!-- 卡片容器 -->
    <div class="memory-cards-container">
      <div class="memory-usage-container">
        <div class="metric-card">
          <el-progress 
            :percentage="memoryData.usage" 
            :color="getMemoryColor(memoryData.usage)"
            :stroke-width="10"
            :show-text="false"
            class="memory-progress"
          />
          <div class="metric-detail">
            <span class="usage-value" :style="{color: getMemoryColor(memoryData.usage)}">{{ memoryData.usage }}%</span>
            <p class="memory-info">
              已用: {{ calculateUsedMemory(memoryData.total, memoryData.usage) }}GB / 
              {{ memoryData.total }}GB
            </p>
          </div>
        </div>
      </div>
      <!-- 这里可以添加更多卡片 -->
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  memoryData: {
    type: Object,
    required: true
  }
})

// 获取内存颜色
const getMemoryColor = (usage: number) => {
  if (usage <= 60) return '#67c23a'
  if (usage <= 80) return '#e6a23c'
  return '#f56c6c'
}

// 计算已使用内存
const calculateUsedMemory = (total: number, usagePercentage: number) => {
  const used = (total * usagePercentage / 100).toFixed(1)
  return used
}
</script>

<style scoped lang="scss">
.memory-component {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

// 顶部标题区样式
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    position: relative;
    padding-left: 12px;
  }
}

// 新增卡片容器外层，用于管理五列布局
.memory-cards-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px; // 抵消卡片容器的margin
}

.memory-usage-container {
  width: calc(20% - 16px); // 一行五个卡片
  min-width: 160px;
  margin: 8px;
  
  // 卡片容器样式
  .metric-card {
    padding: 16px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    &:hover {
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    
    .memory-progress {
      margin-bottom: 12px;
    }
    
    .metric-detail {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;

      .usage-value {
        font-size: 20px;
        font-weight: 600;
        margin-right: 8px;
      }
      
      .memory-info {
        font-size: 12px;
        color: #909399;
        margin: 0;
        text-align: right;
      }
    }
  }
}

// 添加响应式布局
@media screen and (max-width: 1200px) {
  .memory-usage-container {
    width: calc(25% - 16px); // 一行四个卡片
  }
}

@media screen and (max-width: 992px) {
  .memory-usage-container {
    width: calc(33.33% - 16px); // 一行三个卡片
  }
}

@media screen and (max-width: 768px) {
  .memory-usage-container {
    width: calc(50% - 16px); // 一行两个卡片
  }
}

@media screen and (max-width: 576px) {
  .memory-usage-container {
    width: calc(100% - 16px); // 一行一个卡片
  }
}
</style>