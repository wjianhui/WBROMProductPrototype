<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <AppHeader :user-info="userInfo" />

    <!-- 主体内容 -->
    <main class="dashboard-main">
       <!-- 左侧侧边导航栏 -->
       <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
        <div class="nav-menu">
          <router-link to="/dashboard/deploy" class="nav-item" active-class="router-link-active">
            <el-icon><Connection /></el-icon>
            <span v-show="!isCollapsed">服务部署</span>
          </router-link>
          <router-link to="/dashboard/monitor" class="nav-item" active-class="router-link-active">
            <el-icon><DataAnalysis /></el-icon>
            <span v-show="!isCollapsed">服务监控</span>
          </router-link>
        </div>
        
        <div class="collapse-btn" @click="toggleSidebar">
          <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
        </div>
      </aside>
      
      <div class="dashboard-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Connection, DataAnalysis, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import AppHeader from '../../components/AppHeader.vue'

const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.dashboard-main {
  flex: 1;
  // padding: 20px;
  display: flex; /* 添加flex布局 */
  gap: 20px;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #81d4fa, #b3e5fc);
  color: white;
  height: calc(100vh - 100px);
  border-radius: 1px 1px 10px 1px;
  position: relative;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 64px;
    
    .nav-item {
      justify-content: center;
      padding: 15px 0;
    }
  }
  
  .collapse-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    
    .el-icon {
      font-size: 14px;
      color: #2196f3; // 修改折叠按钮图标颜色以匹配新主题
    }
  }
  
  .nav-menu {
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    
    .nav-item {
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      padding: 15px 20px;
      transition: all 0.3s;
      
      .el-icon {
        margin-right: 10px;
        font-size: 18px;
      }
      
      &:hover, &.router-link-active {
        background-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

/* 修改主内容区域样式 */
.dashboard-content {
  flex: 1;
  display: flex;
  padding: 20px;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px); /* 减去头部和padding */
  overflow-y: auto;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .dashboard-main {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    
    .nav-item {
      padding: 10px 15px;
    }
  }
  
  .dashboard-content {
    height: auto;
  }
}
</style>