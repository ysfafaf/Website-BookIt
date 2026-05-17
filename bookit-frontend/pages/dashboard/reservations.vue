<script setup lang="ts">
import type { Reservation, StatusAction } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'default' })

const store = useReservationStore()
const error = ref('')

onMounted(() => store.fetchAll())

const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected']

const sorted = computed(() =>
  [...store.reservations].sort((a: Reservation, b: Reservation) =>
    statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )
)

const handleCancel = async (id: string) => {
  if (!confirm('Are you sure you want to cancel this reservation?')) return
  try {
    await store.cancel(id)
  } catch (err: any) {
    error.value = err.message || 'Failed to cancel reservation.'
  }
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric',
    month: 'short', day: 'numeric'
  })

const formatTime = (t: string) => {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0;">
          My Reservations
        </h1>
        <p style="margin:4px 0 0;color:#78716C;font-size:14px;">
          {{ store.reservations.length }} total reservations
        </p>
      </div>
      <NuxtLink to="/dashboard/reserve"
        style="display:inline-flex;align-items:center;gap:6px;background:#D97706;color:#fff;padding:10px 20px;border-radius:9px;font-weight:600;font-size:14px;text-decoration:none;">
        + Book a Table
      </NuxtLink>
    </div>

    <!-- Error -->
    <div v-if="error"
      style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="store.loading" style="display:flex;flex-direction:column;gap:12px;">
      <div v-for="i in 3" :key="i"
        style="height:96px;background:#fff;border-radius:14px;border:1px solid #E5E7EB;">
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="sorted.length === 0"
      style="text-align:center;padding:64px;background:#fff;border-radius:14px;border:1px solid #E5E7EB;">
      <p style="font-size:40px;margin-bottom:12px;">🍽️</p>
      <p style="font-weight:600;color:#1C1917;font-size:16px;margin-bottom:6px;">No reservations yet</p>
      <p style="color:#78716C;font-size:14px;margin-bottom:20px;">Book your first table to get started</p>
      <NuxtLink to="/dashboard/reserve"
        style="display:inline-flex;background:#D97706;color:#fff;padding:10px 24px;border-radius:9px;font-weight:600;font-size:14px;text-decoration:none;">
        Make a Reservation
      </NuxtLink>
    </div>

    <!-- Reservation list -->
    <div v-else style="display:flex;flex-direction:column;gap:12px;">
      <div v-for="r in sorted" :key="r.id"
        style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:16px 20px;">
        <div style="display:flex;align-items:center;gap:16px;">

          <!-- Icon -->
          <div style="width:48px;height:48px;background:#F5F5F4;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;">
            🟠
          </div>

          <!-- Info -->
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="font-weight:700;font-size:15px;color:#1C1917;">
                {{ r.table.table_type_name }}
              </span>
              <StatusBadge :status="r.status" />
            </div>
            <div style="font-size:13px;color:#78716C;margin-bottom:2px;">
              {{ formatDate(r.date) }} · {{ formatTime(r.time) }} · Table T{{ String(r.table.table_number).padStart(2,'0') }}
            </div>
            <div v-if="r.description"
              style="font-size:12px;color:#A8A29E;font-style:italic;">
              "{{ r.description }}"
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:8px;flex-shrink:0;">
            <button
              v-if="['pending', 'confirmed'].includes(r.status)"
              @click="handleCancel(r.id)"
              style="padding:6px 14px;background:#FEE2E2;color:#991B1B;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>