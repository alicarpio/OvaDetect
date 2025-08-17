import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  // Getters
  const userName = computed(() => user.value?.name || 'Usuario')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || 'doctor')
  const userAvatar = computed(() => user.value?.avatar || '/default-avatar.png')
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  function login(userData: User) {
    loading.value = true
    // Simular llamada a API
    setTimeout(() => {
      user.value = userData
      isAuthenticated.value = true
      loading.value = false
    }, 1000)
  }

  function logout() {
    loading.value = true
    // Simular llamada a API
    setTimeout(() => {
      user.value = null
      isAuthenticated.value = false
      loading.value = false
    }, 500)
  }

  function updateProfile(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  // Login demo para desarrollo
  function loginDemo() {
    login({
      id: '1',
      name: 'Dr. María González',
      email: 'maria.gonzalez@hospital.com',
      role: 'doctor',
      avatar: 'https://via.placeholder.com/150'
    })
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    // Getters
    userName,
    userEmail,
    userRole,
    userAvatar,
    isDoctor,
    isAdmin,
    // Actions
    login,
    logout,
    updateProfile,
    loginDemo
  }
})
