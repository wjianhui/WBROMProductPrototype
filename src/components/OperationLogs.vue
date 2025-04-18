<template>
  <div class="operation-logs">
    <div class="operation-header">
      <h3>服务操作记录</h3>
      <div class="operation-filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
        <el-select v-model="serviceFilter" placeholder="服务筛选" clearable @change="handleFilterChange">
          <el-option
            v-for="item in serviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select v-model="operationFilter" placeholder="操作类型" clearable @change="handleFilterChange">
          <el-option label="启动" value="start" />
          <el-option label="停止" value="stop" />
        </el-select>
      </div>
    </div>

    <el-table
      :data="filteredLogs"
      style="width: 100%"
      border
      stripe
      height="calc(100% - 80px)"
      v-loading="loading"
    >
      <el-table-column prop="timestamp" label="操作时间" width="180" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="serviceName" label="服务名称" width="180" />
      <el-table-column prop="operation" label="操作类型">
        <template #default="scope">
          <el-tag :type="scope.row.operation === 'start' ? 'success' : 'danger'">
            {{ scope.row.operation === 'start' ? '启动' : '停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
            {{ scope.row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button 
              type="primary" 
              size="small" 
              @click="downloadLog(scope.row)"
              :disabled="!scope.row.hasLog"
            >
              下载日志
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              @click="viewLog(scope.row)"
              :disabled="!scope.row.hasLog"
            >
              查看日志
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalLogs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { DateModelType } from 'element-plus';

interface OperationLog {
  id: string;
  serviceName: string;
  operation: 'start' | 'stop';
  timestamp: number;
  operator: string;
  status: 'success' | 'failed';
  hasLog: boolean;
  logPath?: string;
}

// 模拟数据
const mockLogs: OperationLog[] = [
  {
    id: '1',
    serviceName: '飞灵web服务',
    operation: 'start',
    timestamp: Date.now() - 3600000 * 24,
    operator: 'admin',
    status: 'success',
    hasLog: true,
    logPath: '/logs/nginx-start-20230601.log'
  },
  {
    id: '2',
    serviceName: '飞灵模型服务',
    operation: 'stop',
    timestamp: Date.now() - 3600000 * 12,
    operator: 'admin',
    status: 'success',
    hasLog: true,
    logPath: '/logs/mysql-stop-20230601.log'
  },
  {
    id: '3',
    serviceName: '管家web服务',
    operation: 'start',
    timestamp: Date.now() - 3600000 * 6,
    operator: 'system',
    status: 'failed',
    hasLog: true,
    logPath: '/logs/redis-start-20230601.log'
  },
  {
    id: '4',
    serviceName: '管家模型服务',
    operation: 'start',
    timestamp: Date.now() - 3600000 * 2,
    operator: 'admin',
    status: 'success',
    hasLog: false
  }
];

// 生成更多模拟数据
for (let i = 4; i <= 4; i++) {
  const services = ['nginx', 'mysql', 'redis', 'mongodb', 'rabbitmq', 'elasticsearch'];
  const operators = ['admin', 'system', 'user1', 'user2'];
  const operations: ('start' | 'stop')[] = ['start', 'stop'];
  const statuses: ('success' | 'failed')[] = ['success', 'failed'];
  
  mockLogs.push({
    id: i.toString(),
    serviceName: services[Math.floor(Math.random() * services.length)],
    operation: operations[Math.floor(Math.random() * operations.length)],
    timestamp: Date.now() - Math.floor(Math.random() * 3600000 * 72),
    operator: operators[Math.floor(Math.random() * operators.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    hasLog: Math.random() > 0.3,
    logPath: Math.random() > 0.3 ? `/logs/service-${i}-log.log` : undefined
  });
}

// 状态变量
const logs = ref<OperationLog[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const dateRange = ref<DateModelType>(null);
const serviceFilter = ref('');
const operationFilter = ref('');

// 服务选项
const serviceOptions = computed(() => {
  const services = new Set(logs.value.map(log => log.serviceName));
  return Array.from(services).map(service => ({
    value: service,
    label: service
  }));
});

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

// 过滤后的日志
const filteredLogs = computed(() => {
  let result = [...logs.value];
  
  // 日期筛选
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startTime = new Date(dateRange.value[0]).getTime();
    const endTime = new Date(dateRange.value[1]).getTime() + 86400000; // 加一天，包含结束日期
    result = result.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  }
  
  // 服务筛选
  if (serviceFilter.value) {
    result = result.filter(log => log.serviceName === serviceFilter.value);
  }
  
  // 操作类型筛选
  if (operationFilter.value) {
    result = result.filter(log => log.operation === operationFilter.value);
  }
  
  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  
  return result.slice(startIndex, endIndex);
});

// 总日志数
const totalLogs = computed(() => {
  let result = [...logs.value];
  
  // 日期筛选
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startTime = new Date(dateRange.value[0]).getTime();
    const endTime = new Date(dateRange.value[1]).getTime() + 86400000;
    result = result.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  }
  
  // 服务筛选
  if (serviceFilter.value) {
    result = result.filter(log => log.serviceName === serviceFilter.value);
  }
  
  // 操作类型筛选
  if (operationFilter.value) {
    result = result.filter(log => log.operation === operationFilter.value);
  }
  
  return result.length;
});

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 处理日期变化
const handleDateChange = () => {
  currentPage.value = 1;
};

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1;
};

// 下载日志
const downloadLog = (log: OperationLog) => {
  if (!log.hasLog) {
    ElMessage.warning('该操作没有可下载的日志');
    return;
  }
  
  ElMessage.success(`正在下载 ${log.serviceName} 的操作日志...`);
  
  // 这里是模拟下载，实际项目中应该调用后端API
  setTimeout(() => {
    ElMessage.success(`${log.serviceName} 的操作日志下载完成`);
  }, 1500);
};

// 查看日志
const viewLog = (log: OperationLog) => {
  if (!log.hasLog) {
    ElMessage.warning('该操作没有可查看的日志');
    return;
  }
  
  ElMessage.success(`正在加载 ${log.serviceName} 的操作日志...`);
  
  // 模拟加载日志内容
  setTimeout(() => {
    // 实际项目中应该调用后端API获取日志内容
    const logContent = `服务: ${log.serviceName}\n操作: ${log.operation === 'start' ? '启动' : '停止'}\n时间: ${formatDate(log.timestamp)}\n操作人: ${log.operator}\n状态: ${log.status === 'success' ? '成功' : '失败'}\n\n日志详情:\n${generateMockLogContent(log)}`;
    
    ElMessageBox.alert(logContent, '日志内容', {
      confirmButtonText: '关闭',
      customClass: 'log-preview-dialog'
    });
  }, 800);
};

// 生成模拟日志内容
const generateMockLogContent = (log: OperationLog) => {
  const lines = [];
  const actionType = log.operation === 'start' ? '启动' : '停止';
  const status = log.status === 'success' ? '成功' : '失败';
  
  lines.push(`[INFO] ${formatDate(log.timestamp)} 开始${actionType}服务 ${log.serviceName}`);
  lines.push(`[INFO] ${formatDate(log.timestamp + 1000)} 检查服务依赖...`);
  lines.push(`[INFO] ${formatDate(log.timestamp + 2000)} 依赖检查完成`);
  
  if (log.status === 'success') {
    lines.push(`[INFO] ${formatDate(log.timestamp + 3000)} 服务${actionType}中...`);
    lines.push(`[INFO] ${formatDate(log.timestamp + 5000)} 服务${actionType}完成`);
    lines.push(`[SUCCESS] ${formatDate(log.timestamp + 5500)} 服务${actionType}${status}`);
  } else {
    lines.push(`[ERROR] ${formatDate(log.timestamp + 3000)} 服务${actionType}失败`);
    lines.push(`[ERROR] ${formatDate(log.timestamp + 3500)} 错误原因: 连接超时`);
    lines.push(`[WARN] ${formatDate(log.timestamp + 4000)} 尝试重新${actionType}...`);
    lines.push(`[ERROR] ${formatDate(log.timestamp + 6000)} 重试${actionType}失败`);
    lines.push(`[FAILED] ${formatDate(log.timestamp + 6500)} 服务${actionType}${status}`);
  }
  
  return lines.join('\n');
};

// 获取日志数据
const fetchLogs = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.value = mockLogs.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('获取操作日志失败', error);
    ElMessage.error('获取操作日志失败');
  } finally {
    loading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped lang="scss">
.operation-logs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.operation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .operation-filters {
    display: flex;
    gap: 10px;
    
    .el-date-picker,
    .el-select {
      width: 220px;
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .operation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    
    .operation-filters {
      flex-wrap: wrap;
    }
  }
}

@media screen and (max-width: 768px) {
  .operation-filters {
    flex-direction: column;
    width: 100%;
    
    .el-date-picker,
    .el-select {
      width: 100% !important;
    }
  }
}

/* 日志预览对话框样式 */
:deep(.log-preview-dialog) {
  .el-message-box__content {
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-wrap;
    font-family: monospace;
  }
}
</style>