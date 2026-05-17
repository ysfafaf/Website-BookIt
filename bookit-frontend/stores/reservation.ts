import { defineStore } from 'pinia'
import type { Reservation, Pagination } from '~/types'

export const useReservationStore = defineStore('reservation', () => {
  const api = useApi()

  const reservations = ref<Reservation[]>([])
  const pagination   = ref<Pagination | null>(null)
  const stats        = ref<any>(null)
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  const fetchAll = async (params?: Record<string, any>) => {
    loading.value = true
    error.value   = null
    try {
      const data         = await api.get('/reservations', params)
      reservations.value = data.items as Reservation[]
      pagination.value   = data.pagination as Pagination
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      stats.value = await api.get('/reservations/stats')
    } catch (err: any) {
      error.value = err.message
    }
  }

  const create = async (payload: {
    table_type_id: string
    date: string
    time: string
    description?: string
  }) => {
    return await api.post('/reservations', payload)
  }

  const cancel = async (id: string) => {
    const updated = await api.patch(`/reservations/${id}/cancel`, {}) as Reservation
    const index = reservations.value.findIndex((r) => r.id === id)
    if (index !== -1) reservations.value[index] = updated
  }

  const updateStatus = async (id: string, status: string) => {
    const updated = await api.patch(`/reservations/${id}/status`, { status }) as Reservation
    const index = reservations.value.findIndex((r) => r.id === id)
    if (index !== -1) reservations.value[index] = updated
  }

  return {
    reservations, pagination, stats,
    loading, error,
    fetchAll, fetchStats, create, cancel, updateStatus
  }
})