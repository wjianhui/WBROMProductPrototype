import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({
    username: '',
    avatar: ''
  })

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
  }

  function setUserInfo(info: any) {
    userInfo.value = info
  }

  return {
    token,
    userInfo,
    setToken,
    clearToken,
    setUserInfo
  }
})