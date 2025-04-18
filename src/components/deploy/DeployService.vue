<template>
  <div class="deploy-content">
    <!-- 上传区域 -->
    <el-card class="upload-section">
      <div class="upload-area" @click="triggerUpload" :class="{ 'is-uploading': isUploading }">
        <input type="file" ref="fileInput" @change="handleFileChange" accept=".zip,.jar" style="display: none" />
        <template v-if="!currentFile && !isUploading">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <p>点击上传服务安装包</p>
          <p class="upload-tip">支持 .zip、.jar 等格式</p>
        </template>
        <template v-else-if="isUploading">
          <p class="file-name">{{ currentFile?.name }}</p>
          <el-progress 
            :percentage="uploadProgress" 
            :format="progressFormat"
            status="exception"
            v-if="uploadError"
          ></el-progress>
          <el-progress 
            :percentage="uploadProgress" 
            :format="progressFormat"
            v-else
          ></el-progress>
          <p class="upload-status">{{ uploadStatus }}</p>
          <el-button v-if="uploadError" size="small" type="primary" @click.stop="retryUpload">重试</el-button>
        </template>
        <template v-else>
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <p class="file-name">{{ currentFile?.name }}</p>
          <p class="file-size">{{ formatFileSize(currentFile?.size??0) }}</p>
          <el-button size="small" type="danger" @click.stop="removeFile">移除</el-button>
        </template>
      </div>
      
      <!-- 一键部署按钮 -->
      <div class="deploy-action">
        <el-button 
          type="primary" 
          :disabled="!canDeploy" 
          :loading="isDeploying"
          @click="startDeploy"
          class="deploy-button"
        >
          一键部署
        </el-button>
      </div>
      
      <!-- 部署进度 -->
      <div class="deploy-progress" v-if="isDeploying">
        <el-steps :active="activeStep" finish-status="success" direction="vertical">
          <el-step v-for="(step, index) in deploySteps" :key="index" :title="step.title" :description="step.description">
            <template #description>
              <div v-if="index === activeStep">{{ currentStepDetail }}</div>
              <div v-else-if="index < activeStep">{{ step.description }}</div>
            </template>
          </el-step>
        </el-steps>
      </div>
      
      <!-- 部署错误信息 -->
      <div class="deploy-error" v-if="deployError">
        <el-alert
          title="部署失败"
          type="error"
          :description="deployError"
          show-icon
          :closable="false"
        >
          <template #default>
            <p>{{ deployError }}</p>
            <el-link type="primary" href="#" @click.prevent="showErrorHelp">查看解决方案</el-link>
          </template>
        </el-alert>
      </div>
    </el-card>
    
    <!-- 部署记录 -->
    <el-card class="deploy-records" v-if="deployRecords.length > 0">
      <template #header>
        <div class="card-header">
          <span>部署记录</span>
        </div>
      </template>
      <el-table :data="deployRecords" stripe style="width: 100%">
        <el-table-column prop="time" label="部署时间" width="180"></el-table-column>
        <el-table-column prop="serviceName" label="服务名称" width="180"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === '失败'" 
              type="danger" 
              size="small" 
              circle
              @click="showErrorLog(scope.row)"
            >
              <el-icon><Warning /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 错误日志对话框 -->
    <el-dialog
      v-model="errorLogVisible"
      title="部署错误日志"
      width="60%"
    >
      <pre class="error-log">{{ currentErrorLog }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, CircleCheck, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)
const currentFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadError = ref(false)

// 部署相关
const isDeploying = ref(false)
const canDeploy = computed(() => currentFile.value && !isUploading.value && !uploadError.value)
const deployError = ref('')
const activeStep = ref(0)
const currentStepDetail = ref('')
const deploySteps = [
  { title: '解析安装包', description: '验证安装包完整性并解析内容' },
  { title: '检查依赖关系', description: '确认所需的系统依赖是否满足' },
  { title: '配置环境变量', description: '设置必要的环境变量和配置文件' },
  { title: '安装服务组件', description: '将服务组件安装到指定位置' },
  { title: '启动服务', description: '启动并验证服务是否正常运行' }
]

// 部署记录
const deployRecords = ref([
  { 
    time: '2023-11-01 14:30:22', 
    serviceName: 'API网关服务', 
    version: 'v1.2.0',
    status: '成功',
    errorLog: '' 
  },
  { 
    time: '2023-11-01 10:15:45', 
    serviceName: '数据处理服务', 
    version: 'v0.9.5',
    status: '失败',
    errorLog: 'Error: 端口8080已被占用\n尝试启动服务时发现端口冲突\n请检查是否有其他服务正在使用该端口' 
  }
])

// 错误日志
const errorLogVisible = ref(false)
const currentErrorLog = ref('')

// 触发文件选择
const triggerUpload = () => {
  if (isUploading.value) return
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    // 检查文件类型
    const validTypes = ['.zip', '.jar']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validTypes.includes(fileExt)) {
      ElMessage.error('不支持的文件格式，请上传 .zip 或 .jar 格式的文件')
      return
    }
    
    currentFile.value = file
    simulateUpload()
  }
}

// 模拟上传过程
const simulateUpload = () => {
  isUploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = '正在上传...'
  uploadError.value = false
  
  const totalSize = currentFile.value?.size || 0
  const uploadSpeed = 1024 * 1024 // 1MB/s
  const totalTime = totalSize / uploadSpeed * 1000 // 毫秒
  const interval = 100 // 更新间隔
  const steps = totalTime / interval
  const increment = 100 / steps
  
  let timer = setInterval(() => {
    uploadProgress.value += increment
    
    // 计算剩余时间
    const remaining = ((100 - uploadProgress.value) / 100) * totalTime / 1000
    uploadStatus.value = `正在上传...剩余 ${remaining.toFixed(1)} 秒`
    
    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      uploadProgress.value = 100
      uploadStatus.value = '上传完成，校验中...'
      
      // 模拟校验过程
      setTimeout(() => {
        // 随机模拟上传成功或失败
        const success = Math.random() > 0.2
        
        if (success) {
          isUploading.value = false
          uploadStatus.value = '上传成功'
          ElMessage.success('文件上传成功')
        } else {
          uploadError.value = true
          uploadStatus.value = '上传失败，文件可能已损坏'
          ElMessage.error('文件校验失败，请重试')
        }
      }, 1500)
    }
  }, interval)
}

// 重试上传
const retryUpload = () => {
  if (currentFile.value) {
    simulateUpload()
  }
}

// 移除文件
const removeFile = () => {
  currentFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 格式化进度条
const progressFormat = (percentage: number) => {
  return uploadError.value ? '失败' : percentage === 100 ? '完成' : `${percentage.toFixed(0)}%`
}

// 开始部署
const startDeploy = () => {
  isDeploying.value = true
  deployError.value = ''
  activeStep.value = 0
  currentStepDetail.value = '正在解析安装包内容...'
  
  // 模拟部署过程
  simulateDeployStep()
}

// 模拟部署步骤
const simulateDeployStep = () => {
  const stepDetails = [
    ['解析安装包内容...', '识别服务类型...', '准备部署环境...'],
    ['检查系统依赖...', '验证依赖版本...', '确认依赖关系...'],
    ['配置环境变量...', '创建配置文件...', '准备数据目录...'],
    ['复制服务文件...', '设置权限...', '注册服务...'],
    ['初始化服务...', '启动服务进程...', '验证服务健康状态...']
  ]
  
  let currentDetailIndex = 0
  const updateDetail = () => {
    if (currentDetailIndex < stepDetails[activeStep.value].length) {
      currentStepDetail.value = stepDetails[activeStep.value][currentDetailIndex]
      currentDetailIndex++
      setTimeout(updateDetail, 1500)
    } else {
      // 当前步骤的所有细节都展示完毕，进入下一步
      if (activeStep.value < deploySteps.length - 1) {
        activeStep.value++
        currentDetailIndex = 0
        setTimeout(updateDetail, 500)
      } else {
        // 所有步骤完成
        finishDeploy()
      }
    }
  }
  
  // 随机模拟部署成功或失败
  const willSucceed = Math.random() > 0.3
  
  if (willSucceed) {
    updateDetail()
  } else {
    // 模拟在某个随机步骤失败
    const failStep = Math.floor(Math.random() * 4)
    const failTimer = setTimeout(() => {
      if (activeStep.value >= failStep) {
        clearTimeout(failTimer)
        deployFailed()
      }
    }, (failStep + 1) * 4500)
    
    updateDetail()
  }
}

// 部署完成
const finishDeploy = () => {
  isDeploying.value = false
  ElMessage.success('服务部署成功')
  
  // 添加部署记录
  if (currentFile.value) {
    const serviceName = currentFile.value.name.split('.')[0]
    const version = extractVersionFromFileName(currentFile.value.name)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    deployRecords.value.unshift({
      time: timeStr,
      serviceName,
      version,
      status: '成功',
      errorLog: ''
    })
  }
}

// 部署失败
const deployFailed = () => {
  isDeploying.value = false
  
  // 根据当前步骤生成不同的错误信息
  const errorMessages = [
    '安装包解析失败：文件格式不正确或已损坏',
    '依赖检查失败：缺少必要的系统依赖',
    '环境配置失败：无法创建配置文件或设置环境变量',
    '服务安装失败：无法将组件安装到指定位置',
    '服务启动失败：端口8080已被占用或服务无响应'
  ]
  
  deployError.value = errorMessages[activeStep.value]
  
  // 添加部署记录
  if (currentFile.value) {
    const serviceName = currentFile.value.name.split('.')[0]
    const version = extractVersionFromFileName(currentFile.value.name)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    const errorLog = `Error: ${deployError.value}\n详细信息：在${deploySteps[activeStep.value].title}阶段失败\n可能原因：${errorMessages[activeStep.value]}`
    
    deployRecords.value.unshift({
      time: timeStr,
      serviceName,
      version,
      status: '失败',
      errorLog
    })
  }
}

// 显示错误帮助
const showErrorHelp = () => {
  ElMessageBox.alert(
    '请尝试以下解决方案：\n1. 检查安装包格式是否正确\n2. 确保系统已安装所需依赖\n3. 检查端口是否被占用\n4. 查看详细日志进行排查',
    '解决方案',
    {
      confirmButtonText: '我知道了'
    }
  )
}

// 显示错误日志
const showErrorLog = (record: any) => {
  currentErrorLog.value = record.errorLog
  errorLogVisible.value = true
}

// 从文件名中提取版本号
const extractVersionFromFileName = (fileName: string): string => {
  // 尝试从文件名中提取版本号，格式可能是 name-v1.2.3.jar 或 name_1.2.3.zip
  const versionRegex = /[-_]v?(\d+\.\d+\.\d+)/i;
  const match = fileName.match(versionRegex);
  
  if (match && match[1]) {
    return `v${match[1]}`;
  }
  
  // 如果没有找到版本号，尝试提取任何数字序列作为版本
  const numberRegex = /(\d+\.\d+(\.\d+)?)/;
  const numMatch = fileName.match(numberRegex);
  
  if (numMatch && numMatch[1]) {
    return `v${numMatch[1]}`;
  }
  
  // 如果仍然没有找到，返回默认版本
  return 'v1.0.0';
}
</script>

<style scoped lang="scss">
.deploy-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: rgba(64, 158, 255, 0.05);
  margin-bottom: 20px;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.1);
    border-color: #409eff;
  }
  
  &.is-uploading {
    cursor: default;
  }
  
  .upload-icon {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 10px;
  }
  
  .success-icon {
    font-size: 48px;
    color: #67c23a;
    margin-bottom: 10px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
  
  .file-name {
    font-weight: bold;
    margin-bottom: 10px;
    word-break: break-all;
  }
  
  .file-size {
    color: #909399;
    margin-bottom: 10px;
  }
  
  .upload-status {
    margin: 10px 0;
    color: #606266;
  }
}

.deploy-action {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  
  .deploy-button {
    padding: 12px 30px;
    font-size: 16px;
    
    &:not(:disabled) {
      background: linear-gradient(45deg, #409eff, #2080ff);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
      }
    }
  }
}

.deploy-progress {
  margin: 20px 0;
  
  .current-step-detail {
    text-align: center;
    margin-top: 10px;
    color: #409eff;
    font-weight: 500;
  }
}

.deploy-error {
  margin: 20px 0;
}

.deploy-records {
  margin-top: 20px;
  
  .card-header {
    font-weight: bold;
  }
}

.error-log {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  color: #e6a23c;
  border-left: 4px solid #f56c6c;
}
</style>