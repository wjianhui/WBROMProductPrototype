<template>
  <div class="login-container fresh-bg">
    <div class="login-layout">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="logo-area">
            <!-- <img src="../../assets/logo.png" alt="Logo" class="logo" /> -->
          </div>
          <h1>AI智能运维平台</h1>
          <p>基于人工智能的新一代运维管理系统</p>
          <div class="brand-decoration"></div>
        </div>
      </div>
      
      <!-- 右侧登录表单区域 -->
      <div class="login-box fresh-card">
        <div class="login-header">
          <h2>账号登录</h2>
          <p>欢迎使用运维管理系统</p>
        </div>
        
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入账号" 
              prefix-icon="el-icon-user"
              :class="{ 'input-focus': activeInput === 'username' }"
              @focus="activeInput = 'username'"
              @blur="activeInput = ''"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              show-password
              :class="{ 'input-focus': activeInput === 'password' }"
              @focus="activeInput = 'password'"
              @blur="activeInput = ''"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>        
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 清新简约的背景元素 -->
    <div class="fresh-elements"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 输入框焦点状态
const activeInput = ref('')

// 加载状态
const loading = ref(false)

// 登录处理
const handleLogin = () => {
  loading.value = true
  
  setTimeout(() => {
    // 设置一个模拟的token，避免路由守卫拦截
    localStorage.setItem('token', 'mock-token')
    
    // 设置用户信息
    userStore.setUserInfo({
      username: loginForm.username || 'admin',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    })
    
    ElMessage.success('登录成功')
    
    // 使用replace而不是push，避免浏览器返回按钮回到登录页
    //跳转到首页

    router.replace('/dashboard')
    
    loading.value = false
  }, 800) // 添加短暂延迟，模拟登录过程
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // background: linear-gradient(135deg, #f5f7fa, #e4e8f0);
  background-image: url('https://p3-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_generation/698c6b92200ce778c6d504711ddad14a_1741676559693567649.jpeg~tplv-a9rns2rl98-image.jpeg?rk3s=25bff839&x-expires=1773212559&x-signature=qGR6OZo4EXnztqMSLEtyOP8gHf4%3D');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.login-layout {
  display: flex;
  width: 900px;
  height: 560px;
  z-index: 10;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

// 左侧品牌区域样式
.login-brand {
  flex: 1;
  // background: linear-gradient(135deg, #4facfe, #00f2fe);
  background-image: url('https://p3-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_generation/698c6b92200ce778c6d504711ddad14a_1741676559693567649.jpeg~tplv-a9rns2rl98-image.jpeg?rk3s=25bff839&x-expires=1773212559&x-signature=qGR6OZo4EXnztqMSLEtyOP8gHf4%3D');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(79, 172, 254, 0.6);
    z-index: 1;
  }
  
  .brand-content {
    text-align: center;
    padding: 0 40px;
    z-index: 2;
    
    h1 {
      font-size: 32px;
      font-weight: 600;
      margin: 20px 0;
      letter-spacing: 1px;
    }
    
    p {
      font-size: 16px;
      opacity: 0.9;
      max-width: 280px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .logo-area {
      margin-bottom: 30px;
      
      .logo {
        width: 80px;
        height: 80px;
        object-fit: contain;
      }
    }
  }
  
  .brand-decoration {
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: -80px;
      right: -80px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 50px;
      right: -150px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

// 右侧登录框样式
.login-box {
  width: 450px;
  padding: 50px 40px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    font-size: 28px;
    color: #4facfe;
    margin-bottom: 10px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    letter-spacing: 0.5px;
  }
}

.login-form {
  margin-bottom: 20px;
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 4px 12px;
    box-shadow: 0 0 0 1px #e0e0e0 inset;
    transition: all 0.3s;
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4facfe inset;
    }
    
    &:hover {
      box-shadow: 0 0 0 1px #4facfe inset;
    }
  }
  
  :deep(.el-input__inner) {
    height: 42px;
    font-size: 15px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.el-button) {
    border-radius: 8px;
    background: #4facfe;
    border: none;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    transition: all 0.3s;
    width: 100%;
    
    &:hover {
      background: #3a9efd;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.input-focus {
  transform: scale(1.02);
  transition: all 0.3s ease;
}

// 清新简约的背景元素
.fresh-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 10% 10%, rgba(79, 172, 254, 0.1) 0%, transparent 15%),
      radial-gradient(circle at 90% 20%, rgba(0, 242, 254, 0.1) 0%, transparent 20%),
      radial-gradient(circle at 20% 80%, rgba(79, 172, 254, 0.08) 0%, transparent 25%),
      radial-gradient(circle at 80% 90%, rgba(0, 242, 254, 0.08) 0%, transparent 15%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234facfe' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }
}

// 添加响应式调整
@media (max-width: 960px) {
  .login-layout {
    width: 90%;
    max-width: 900px;
    flex-direction: column;
    height: auto;
  }
  
  .login-brand {
    padding: 40px 20px;
    
    .brand-content {
      h1 {
        font-size: 28px;
      }
    }
  }
  
  .login-box {
    width: 100%;
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-layout {
    width: 95%;
  }
  
  .login-brand {
    padding: 30px 15px;
    
    .brand-content {
      h1 {
        font-size: 24px;
      }
      
      p {
        font-size: 14px;
      }
    }
  }
  
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
}
</style>