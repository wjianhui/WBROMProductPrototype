<template>
  <header class="dashboard-header">
    <div class="logo">
      <span>AI运维管理系统</span>
    </div>

    <div class="user-info">
      <el-dropdown trigger="click">
        <div class="user-avatar">
          <span>{{ username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const username = computed(() => props.userInfo.username)

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    userStore.clearToken()
    router.push('/login')
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped lang="scss">
.dashboard-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(90deg, #2196f3, #81d4fa);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .logo {
    font-size: 20px;
    font-weight: 500;
    
    span {
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      -webkit-text-fill-color: initial;
      background: none;
    }
  }
  
  .user-info {
    .user-avatar {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      span {
        margin: 0 8px;
      }
    }
  }
}
</style>