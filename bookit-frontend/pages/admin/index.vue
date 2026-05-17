<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const store = useReservationStore()

onMounted(async () => {
  await store.fetchStats()
  await store.fetchAll({ limit: 5 })
})

const statCards = computed(() => [
  { label: 'Total Reservations', value: store.stats?.counts.total    ?? 0 },
  { label: 'Pending',            value: store.stats?.counts.pending  ?? 0 },
  { label: 'Confirmed',          value: store.stats?.counts.confirmed ?? 0 },
  { label: 'Rejected',           value: store.stats?.counts.rejected  ?? 0 },
])
</script>

<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0;">Dashboard</h1>
        <p style="margin:4px 0 0;color:#78716C;font-size:14px;">Overview of your restaurant's reservations</p>
      </div>
    </div>

    <!-- Stat cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">
      <div v-for="s in statCards" :key="s.label"
        style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:1.5rem;">
        <p style="margin:0;font-size:13px;color:#78716C;font-weight:500;">{{ s.label }}</p>
        <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#1C1917;">{{ s.value }}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

      <!-- Recent reservations -->
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;font-family:'Playfair Display',serif;color:#1C1917;">Recent Reservations</h3>
          <NuxtLink to="/admin/reservations" style="color:#D97706;font-size:13px;font-weight:600;text-decoration:none;">View all →</NuxtLink>
        </div>

        <div v-if="store.loading" v-for="i in 5" :key="i"
          style="height:44px;background:#F5F5F4;border-radius:8px;margin-bottom:8px;animation:pulse 1.5s infinite;"></div>

        <div v-else-if="store.reservations.length === 0"
          style="text-align:center;padding:24px;color:#78716C;font-size:14px;">
          No reservations yet.
        </div>

        <div v-else>
          <div v-for="r in store.reservations" :key="r.id"
            style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F5F4;">
            <div style="width:34px;height:34px;background:#FEF3C7;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#92400E;flex-shrink:0;">
              {{ r.user.name.charAt(0) }}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;color:#1C1917;">{{ r.user.name }}</div>
              <div style="font-size:12px;color:#78716C;">{{ r.date }} · {{ r.time }}</div>
            </div>
            <StatusBadge :status="r.status" />
          </div>
        </div>
      </div>

      <!-- Table overview -->
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:1.5rem;">
        <h3 style="margin:0 0 16px;font-size:16px;font-family:'Playfair Display',serif;color:#1C1917;">Table Overview</h3>

        <div v-if="store.stats" style="display:flex;flex-direction:column;gap:10px;">
          <div v-for="t in store.stats.tableOverview" :key="t.name"
            style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:13px;font-weight:500;color:#374151;width:80px;text-transform:capitalize;">{{ t.name }}</div>
            <div style="flex:1;height:8px;background:#F5F5F4;border-radius:4px;overflow:hidden;">
              <div style="height:100%;background:#D97706;border-radius:4px;" :style="`width:${(t.total / 10) * 100}%`"></div>
            </div>
            <div style="font-size:13px;font-weight:600;color:#1C1917;width:20px;">{{ t.total }}</div>
          </div>
        </div>

        <div style="margin-top:16px;padding:12px 14px;background:#F5F5F4;border-radius:10px;">
          <div style="font-size:13px;color:#78716C;">Total tables</div>
          <div style="font-size:24px;font-weight:700;color:#1C1917;">
            {{ store.stats?.tableOverview.reduce((a: number, t: any) => a + t.total, 0) ?? 0 }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>