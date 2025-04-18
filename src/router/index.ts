import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/dashboard/index.vue'
import DeployService from '../components/deploy/DeployService.vue'
import SystemMonitor from '../components/SystemMonitor.vue'
import Login from '../views/login/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  // 添加登录路由
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        redirect: '/dashboard/deploy'
      },
      {
        path: 'deploy',
        name: 'deploy',
        component: DeployService
      },
      {
        path: 'monitor',
        name: 'monitor',
        component: SystemMonitor
      }
    ]
  }
]

const router = createRouter({
  // 使用hash模式而不是history模式
  history: createWebHashHistory(),
  routes: routes  // 使用上面定义的routes数组
})

export default router