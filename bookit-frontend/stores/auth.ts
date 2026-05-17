import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = useCookie('bookit_token')
  const api = useApi()

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStaff = computed(() => user.value?.role === 'staff')
  const isCustomer = computed(() => user.value?.role === 'customer')

  const login = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    return data
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const fetchMe = async () => {
    if (!token.value) return
    try {
      user.value = await api.get('/auth/me')
    } catch {
      logout()
    }
  }

  return { user, token, isLoggedIn, isAdmin, isStaff, isCustomer, login, logout, fetchMe }
})