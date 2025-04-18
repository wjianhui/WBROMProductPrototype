<template>
  <div class="metric-card disk-usage">
    <div class="card-header">
      <div class="metric-label">磁盘使用率</div>
    </div>
    <div class="disk-chart">
      <div class="disk-grid">
        <div v-for="(partition, index) in diskData.partitions" :key="index" class="disk-card">
          <div class="disk-info">
            <span>{{ partition.name }}</span>
          </div>
          <el-progress 
            :percentage="partition.usage" 
            :color="getDiskColor(partition.usage)"
            :stroke-width="10"
            :show-text="false"
          />
          <div class="disk-details">
            <div class="disk-info-row">
              <span class="usage-percent" :style="{color: getDiskColor(partition.usage)}">{{ partition.usage }}%</span>
              <div class="disk-capacity">
                <span class="disk-size">已用:{{ partition.used }}GB/{{ partition.total }}GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { te } from 'element-plus/es/locales.mjs';
import { defineProps, defineEmits } from 'vue';

defineEmits(['show-detail']);

const props = defineProps({
  diskData: {
    type: Object,
    required: true
  }
});

// 获取磁盘颜色
const getDiskColor = (usage: number) => {
  if (usage <= 60) return '#67c23a';
  if (usage <= 80) return '#e6a23c';
  return '#f56c6c';
};
</script>

<style scoped lang="scss">
.disk-usage {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .disk-chart {
    flex: 1;
    overflow-y: auto;
    margin-top: 10px;
    
    .disk-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }
    
    .disk-card {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
      }
      
      .disk-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
      
      .disk-details {
        margin-top: 10px;
        
        .disk-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .usage-percent {
          font-weight: 600;
          font-size: 18px;
        }
        
        .disk-capacity {
          display: flex;
        }
      }
      
      .disk-size {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.metric-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 左对齐 */
    border-bottom: 1px solid #ebeef5; /* 添加底部边框分隔 */
    padding-bottom: 12px; /* 底部内边距 */
  }
  
  .metric-label {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%; /* 确保标题占满整行 */
  }
}

/* 悬停效果 */
.disk-bar:hover {
  .disk-info {
    color: #409eff;
  }
  
  .el-progress {
    .el-progress-bar__inner {
      transition: all 0.3s ease;
      filter: brightness(1.1);
    }
  }
}

/* 动画效果 */
.disk-chart {
  .disk-bar {
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateX(5px);
    }
  }
}

/* 响应式布局 */
@media screen and (max-width: 1600px) {
  .disk-usage .disk-chart .disk-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 1200px) {
  .disk-usage .disk-chart .disk-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .disk-usage .disk-chart .disk-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .disk-usage .disk-chart .disk-grid {
    grid-template-columns: 1fr;
  }
}
</style>