<template>
  <div class="server-metrics">
    <!-- CPU使用率 -->
    <CpuUsage :cpu-data="serverData.cpu" />
    
    <!-- GPU使用率 -->
    <GpuUsage @show-detail="$emit('show-gpu-detail')" />
    
    <!-- 内存使用率 -->
    <MemoryUsage :memory-data="serverData.memory" />
    
    <!-- 磁盘使用率 -->
    <DiskUsage :disk-data="serverData.disk" />
  </div>
</template>

<script setup lang="ts">
import CpuUsage from './CpuUsage.vue'
import GpuUsage from './GpuUsage.vue'
import MemoryUsage from './MemoryUsage.vue'
import DiskUsage from './DiskUsage.vue'

// 定义组件属性
defineProps({
  serverData: {
    type: Object,
    required: true
  }
})

// 定义事件
defineEmits(['show-gpu-detail'])
</script>

<style scoped lang="scss">
.server-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
}
</style>