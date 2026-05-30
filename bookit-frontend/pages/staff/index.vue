<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'default' })

const api  = useApi()
const auth = useAuthStore()
const confirmed  = ref<any[]>([])
const loading    = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const data   = await api.get('/reservations', { status: 'confirmed', limit: 50 })
    confirmed.value = data.items
  } finally {
    loading.value = false
  }
})

const today = new Date().toISOString().split('T')[0]
const todayConfirmed = computed(() =>
  confirmed.value.filter((r: any) => r.date === today)
)
</script>

<template>
  <div>
    <div style="margin-bottom:28px;">
      <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0;">Staff Dashboard</h1>
      <p style="margin:4px 0 0;color:#78716C;font-size:14px;">Confirmed reservations ready for table preparation</p>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:24px;">
      
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:1.5rem;">
        <p style="margin:0;font-size:13px;color:#78716C;font-weight:500;">Tables to Prepare</p>
        <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#1C1917;">{{ confirmed.length }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading">
      <div v-for="i in 3" :key="i"
        style="height:88px;background:#fff;border-radius:14px;margin-bottom:12px;border:1px solid #E5E7EB;"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="confirmed.length === 0"
      style="text-align:center;padding:64px;color:#78716C;">
      <p style="font-size:32px;margin-bottom:8px;"></p>
      <p style="font-weight:600;">No confirmed reservations</p>
      <p style="font-size:13px;margin-top:4px;">All clear for now!</p>
    </div>

    <!-- Reservation cards -->
    <div v-else style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;">
      <div v-for="r in confirmed" :key="r.id"
        style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:1.5rem;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:52px;height:52px;background:#D1FAE5;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:14px;font-weight:700;color:#065F46;">
              T{{ String(r.table.table_number).padStart(2,'0') }}
            </span>
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:15px;color:#1C1917;margin-bottom:3px;">{{ r.user.name }}</div>
            <div style="font-size:13px;color:#78716C;">{{ r.date.split('T')[0] }} · {{ r.time }}</div>
            <div style="font-size:12px;color:#92400E;font-weight:600;margin-top:2px;text-transform:capitalize;">
              {{ r.table.table_type_name }} · confirmed
            </div>
          </div>
          <span style="color:#10B981;font-size:20px;">✓</span>
        </div>
        <div v-if="r.description"
          style="margin-top:12px;padding:8px 12px;background:#F5F5F4;border-radius:8px;font-size:12px;color:#78716C;">
          📝 {{ r.description }}
        </div>
      </div>
    </div>
  </div>
</template>