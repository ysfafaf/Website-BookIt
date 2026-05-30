<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const store = useReservationStore()

onMounted(async () => {
  await store.fetchStats()
  await store.fetchAll({ limit: 5 })
})

const statCards = computed(() => [
  { label: 'Total Reservations', value: store.stats?.counts.total     ?? 0 },
  { label: 'Pending',            value: store.stats?.counts.pending   ?? 0 },
  { label: 'Confirmed',          value: store.stats?.counts.confirmed ?? 0 },
  { label: 'Rejected',           value: store.stats?.counts.rejected  ?? 0 },
])
</script>

<template>
  <div>

    <!-- Header -->
    <div style="margin-bottom:24px;">
      <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0 0 4px;">
        Dashboard
      </h1>
      <p style="margin:0;color:#78716C;font-size:14px;">
        Overview of your restaurant's reservations
      </p>
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <div
        v-for="s in statCards"
        :key="s.label"
        style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;"
      >
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="margin:0;font-size:13px;color:#78716C;font-weight:500;">{{ s.label }}</p>
          <span style="font-size:22px;">{{ s.icon }}</span>
        </div>
        <p style="margin:0;font-size:32px;font-weight:700;color:#1C1917;">{{ s.value }}</p>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="dashboard-cols">

      <!-- Recent reservations -->
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;font-family:'Playfair Display',serif;color:#1C1917;">
            Recent Reservations
          </h3>
          <NuxtLink to="/admin/reservations"
            style="color:#D97706;font-size:13px;font-weight:600;text-decoration:none;">
            View all →
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="store.loading">
          <div v-for="i in 5" :key="i"
            style="height:44px;background:#F5F5F4;border-radius:8px;margin-bottom:8px;">
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="store.reservations.length === 0"
          style="text-align:center;padding:24px;color:#78716C;font-size:14px;">
          No reservations yet.
        </div>

        <!-- List -->
        <div v-else>
          <div
            v-for="r in store.reservations"
            :key="r.id"
            style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F5F4;"
          >
            <div style="width:34px;height:34px;background:#FEF3C7;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#92400E;flex-shrink:0;">
              {{ r.user.name.charAt(0) }}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;color:#1C1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ r.user.name }}
              </div>
              <div style="font-size:12px;color:#78716C;">{{ r.date.split('T')[0] }} · {{ r.time }}</div>
            </div>
            <StatusBadge :status="r.status" />
          </div>
        </div>
      </div>

      <!-- Table overview -->
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;">
        <h3 style="margin:0 0 16px;font-size:16px;font-family:'Playfair Display',serif;color:#1C1917;">
          Table Overview
        </h3>

        <div v-if="store.stats" style="display:flex;flex-direction:column;gap:12px;">
          <div
            v-for="t in store.stats.tableOverview"
            :key="t.name"
            style="display:flex;align-items:center;gap:12px;"
          >
            <div style="font-size:13px;font-weight:500;color:#374151;width:100px;text-transform:capitalize;flex-shrink:0;">
              {{ t.name }}
            </div>
            <div style="flex:1;height:8px;background:#F5F5F4;border-radius:4px;overflow:hidden;">
              <div
                style="height:100%;background:#D97706;border-radius:4px;transition:width 0.3s;"
                :style="`width:${Math.min((t.total / 6) * 100, 100)}%`"
              ></div>
            </div>
            <div style="font-size:13px;font-weight:600;color:#1C1917;width:20px;text-align:right;flex-shrink:0;">
              {{ t.total }}
            </div>
          </div>
        </div>

        <div style="margin-top:16px;padding:12px 14px;background:#F5F5F4;border-radius:10px;">
          <div style="font-size:13px;color:#78716C;">Total tables</div>
          <div style="font-size:28px;font-weight:700;color:#1C1917;">
            {{ store.stats?.tableOverview.reduce((a: number, t: any) => a + t.total, 0) ?? 0 }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>