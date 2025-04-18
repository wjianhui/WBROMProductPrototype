// 模拟用户数据
export const users = [
  {
    username: 'admin',
    password: 'Admin@123',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

// 模拟服务器数据
export const serverData = {
  ip: '192.168.1.100',
  serialNumber: 'SRV-2023-XJ78A9B2',
  cpu: {
    usage: 45.6,
    cores: 8,
    model: 'Intel Xeon E5-2680 v4',
    temperature: 58.2, // 新增CPU温度数据，单位：摄氏度
    processes: [
      { name: 'system', usage: 15.2 },
      { name: 'chrome', usage: 12.8 }
    ]
  },
  memory: {
    total: 16, // GB
    usage: 68.3,
    details: [
      { process: 'nginx', usage: 1.2 },
      { process: 'mysql', usage: 3.5 },
      { process: 'node', usage: 2.8 },
      { process: 'system', usage: 3.4 }
    ]
  },
  disk: {
    total: 500, // GB
    partitions: [
      { name: 'C:', total: 120, usage: 75.2 },
      { name: 'D:', total: 180, usage: 42.8 },
      { name: 'E:', total: 200, usage: 28.5 }
    ]
  },
  gpu: {
    model: 'NVIDIA RTX 4090',
    usage: 45,
    temperature: 65,
    memory: {
      total: 24,
      used: 8.5
    },
    processes: [
      { process: 'python3 - AI训练任务', usage: 30, memory: 6.2 },
      { process: 'ffmpeg - 视频转码', usage: 10, memory: 1.8 },
      { process: 'blender - 3D渲染', usage: 5, memory: 0.5 }
    ]
  }
}

// 模拟子服务数据
export const services = [
  { id: 1, name: '监控管家Web服务', ip: '192.168.1.100', port: 80, status: 'running' },
  { id: 2, name: '模型管理服务', ip: '192.168.1.100', port: 3306, status: 'running' },
  
]

// 模拟API请求
export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.username === username && u.password === password)
      if (user) {
        resolve({
          code: 200,
          data: {
            token: 'mock-token-' + Date.now(),
            userInfo: {
              username: user.username,
              avatar: user.avatar
            }
          },
          message: '登录成功'
        })
      } else {
        reject({
          code: 401,
          message: '账号或密码错误'
        })
      }
    }, 800)
  })
}

export const mockResetPassword = (email: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '重置密码链接已发送到您的邮箱'
      })
    }, 1000)
  })
}

export const mockGetServerData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 随机波动CPU和内存使用率，模拟实时数据
      const cpuUsage = Math.min(100, Math.max(0, serverData.cpu.usage + (Math.random() * 10 - 5)))
      const memoryUsage = Math.min(100, Math.max(0, serverData.memory.usage + (Math.random() * 8 - 4)))
      
      const data = {
        ...serverData,
        cpu: {
          ...serverData.cpu,
          usage: parseFloat(cpuUsage.toFixed(1))
        },
        memory: {
          ...serverData.memory,
          usage: parseFloat(memoryUsage.toFixed(1))
        }
      }
      
      resolve({
        code: 200,
        data,
        message: '获取服务器数据成功'
      })
    }, 600)
  })
}

export const mockGetServices = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: services,
        message: '获取服务列表成功'
      })
    }, 500)
  })
}

export const mockOperateService = (id: number, operation: 'restart' | 'stop') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const service = services.find(s => s.id === id)
      if (!service) {
        reject({
          code: 404,
          message: '服务不存在'
        })
        return
      }
      
      // 模拟操作成功率95%
      if (Math.random() > 0.05) {
        if (operation === 'restart') {
          service.status = 'running'
        } else if (operation === 'stop') {
          service.status = 'stopped'
        }
        
        resolve({
          code: 200,
          data: service,
          message: operation === 'restart' ? '重启服务成功' : '停止服务成功'
        })
      } else {
        reject({
          code: 500,
          message: operation === 'restart' ? '重启服务失败' : '停止服务失败'
        })
      }
    }, 1500)
  })
}

export const mockBatchOperateServices = (ids: number[], operation: 'restart' | 'stop') => {
  return new Promise((resolve) => {
    const results: any[] = []
    let processed = 0
    
    const processNext = () => {
      if (processed >= ids.length) {
        resolve({
          code: 200,
          data: {
            total: ids.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
          },
          message: '批量操作完成'
        })
        return
      }
      
      const id = ids[processed]
      mockOperateService(id, operation)
        .then((res: any) => {
          results.push({
            id,
            success: true,
            message: res.message
          })
        })
        .catch((err: any) => {
          results.push({
            id,
            success: false,
            message: err.message
          })
        })
        .finally(() => {
          processed++
          processNext()
        })
    }
    
    processNext()
  })
}