import { defineStore } from 'pinia'
import type { User, Pagination } from '~/types'

export const useUsersStore = defineStore('users', () => {
  const api        = useApi()
  const users      = ref<User[]>([])
  const pagination = ref<Pagination | null>(null)
  const loading    = ref(false)
  const error      = ref<string | null>(null)

  const fetchAll = async (params?: Record<string, any>) => {
    loading.value = true
    error.value   = null
    try {
      const data     = await api.get('/users', params)
      users.value    = data.items as User[]
      pagination.value = data.pagination as Pagination
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (id: string, role: string) => {
    const updated = await api.patch(`/users/${id}/role`, { role }) as User
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) users.value[index] = updated
  }

  const remove = async (id: string) => {
    await api.delete(`/users/${id}`)
    users.value = users.value.filter((u) => u.id !== id)
  }

  return { users, pagination, loading, error, fetchAll, updateRole, remove }
})