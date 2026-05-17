<script setup lang="ts">
import type { Reservation, StatusAction } from '~/types'
import { STATUS_MAP } from '~/types'

definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const store      = useReservationStore()
const search     = ref('')
const filterStatus = ref('all')
const statuses   = ['all', 'pending', 'confirmed', 'rejected', 'completed', 'cancelled']

const load = async () => {
  await store.fetchAll({
    status: filterStatus.value === 'all' ? undefined : filterStatus.value,
    search: search.value || undefined,
  })
}

onMounted(load)
watch([filterStatus], load)

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 400)
})

// ✅ Fixed — properly typed, no more map[action] error
const handle = async (action: StatusAction, id: string) => {
  try {
    if (action === 'cancel') {
      await store.cancel(id)
    } else {
      const newStatus = STATUS_MAP[action]
      await store.updateStatus(id, newStatus)
    }
  } catch (err: any) {
    alert(err.message || 'Action failed.')
  }
}
</script>

<template>
  <div>
    <div style="margin-bottom:28px;">
      <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0;">
        Reservation Management
      </h1>
      <p style="margin:4px 0 0;color:#78716C;font-size:14px;">
        {{ store.pagination?.total ?? 0 }} total reservations
      </p>
    </div>

    <!-- Search + filters -->
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center;">
      <input
        v-model="search"
        placeholder="Search customer or table…"
        style="flex:1;min-width:200px;padding:9px 12px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;background:#fff;"
      />
      <button
        v-for="s in statuses" :key="s"
        @click="filterStatus = s"
        :style="filterStatus === s
          ? 'padding:8px 14px;border:1.5px solid #D97706;border-radius:20px;background:#FEF3C7;color:#92400E;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;text-transform:capitalize;'
          : 'padding:8px 14px;border:1px solid #E5E7EB;border-radius:20px;background:#fff;color:#6B7280;font-size:13px;cursor:pointer;font-family:inherit;text-transform:capitalize;'"
      >
        {{ s }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading">
      <div v-for="i in 5" :key="i"
        style="height:52px;background:#fff;border-radius:8px;margin-bottom:8px;border:1px solid #E5E7EB;">
      </div>
    </div>

    <!-- Table -->
    <div v-else style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">

      <div v-if="store.reservations.length === 0"
        style="text-align:center;padding:48px;color:#78716C;">
        <p style="font-size:24px;margin-bottom:8px;"></p>
        <p>No reservations found.</p>
      </div>

      <table v-else style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#FAFAF9;">
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Customer</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Date</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Time</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Table</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Type</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Status</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in store.reservations" :key="r.id"
            style="border-bottom:1px solid #F5F5F4;">
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:30px;height:30px;background:#FEF3C7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#92400E;">
                  {{ r.user.name.charAt(0) }}
                </div>
                <span style="font-size:14px;font-weight:500;color:#1C1917;">{{ r.user.name }}</span>
              </div>
            </td>
            <td style="padding:12px 16px;color:#374151;font-size:13px;">{{ r.date }}</td>
            <td style="padding:12px 16px;color:#374151;font-size:13px;">{{ r.time }}</td>
            <td style="padding:12px 16px;font-weight:600;color:#1C1917;font-size:13px;">
              T{{ String(r.table.table_number).padStart(2, '0') }}
            </td>
            <td style="padding:12px 16px;color:#6B7280;font-size:13px;text-transform:capitalize;">
              {{ r.table.table_type_name }}
            </td>
            <td style="padding:12px 16px;">
              <StatusBadge :status="r.status" />
            </td>
            <td style="padding:12px 16px;">
              <div style="display:flex;gap:6px;">
                <template v-if="r.status === 'pending'">
                  <button @click="handle('confirm', r.id)"
                    style="padding:6px 14px;background:#D1FAE5;color:#065F46;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
                    Confirm
                  </button>
                  <button @click="handle('reject', r.id)"
                    style="padding:6px 14px;background:#FEE2E2;color:#991B1B;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
                    Reject
                  </button>
                </template>
                <button v-if="r.status === 'confirmed'" @click="handle('complete', r.id)"
                  style="padding:6px 14px;background:#EFF6FF;color:#1E40AF;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
                  Complete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.pagination && store.pagination.totalPages > 1"
        style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid #F5F5F4;">
        <span style="font-size:13px;color:#78716C;">
          Page {{ store.pagination.page }} of {{ store.pagination.totalPages }}
        </span>
        <div style="display:flex;gap:8px;">
          <button
            :disabled="!store.pagination.hasPrev"
            @click="store.fetchAll({ page: store.pagination!.page - 1 })"
            style="padding:6px 14px;border:1px solid #E5E7EB;border-radius:9px;background:#fff;font-size:13px;cursor:pointer;font-family:inherit;"
            :style="!store.pagination.hasPrev ? 'opacity:0.4;cursor:not-allowed;' : ''"
          >← Prev</button>
          <button
            :disabled="!store.pagination.hasNext"
            @click="store.fetchAll({ page: store.pagination!.page + 1 })"
            style="padding:6px 14px;border:1px solid #E5E7EB;border-radius:9px;background:#fff;font-size:13px;cursor:pointer;font-family:inherit;"
            :style="!store.pagination.hasNext ? 'opacity:0.4;cursor:not-allowed;' : ''"
          >Next →</button>
        </div>
      </div>
    </div>
  </div>
</template>