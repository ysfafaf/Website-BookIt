<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const customerLinks = [
  { label: 'Home',             to: '/dashboard',         icon: 'grid' },
  { label: 'Make Reservation', to: '/dashboard/reserve', icon: 'calendar' },
  { label: 'My Reservations',  to: '/dashboard/reservations', icon: 'book' },
]

const adminLinks = [
  { label: 'Dashboard',    to: '/admin',              icon: 'grid' },
  { label: 'Reservations', to: '/admin/reservations', icon: 'book' },
  { label: 'Tables',       to: '/admin/tables',       icon: 'table' },
  { label: 'Users',        to: '/admin/users',        icon: 'users' },
]

const staffLinks = [
  { label: 'Dashboard', to: '/staff', icon: 'grid' },
]

const links = computed(() => {
  if (auth.isAdmin)  return adminLinks
  if (auth.isStaff)  return staffLinks
  return customerLinks
})

const initial = computed(() =>
  auth.user?.name?.charAt(0).toUpperCase() || '?'
)
</script>

<template>
  <div style="display:flex;min-height:100vh;background:#E8E8E8;font-family:'DM Sans',sans-serif;">

    <!-- Sidebar -->
    <aside style="width:240px;background:#1C1917;display:flex;flex-direction:column;flex-shrink:0;position:fixed;top:0;left:0;height:100vh;z-index:50;">

      <!-- Brand -->
      <div style="padding:24px 20px 20px;border-bottom:1px solid #292524;display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#D97706;border-radius:9px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:700;font-size:16px;font-family:'Playfair Display',serif;">B</span>
        </div>
        <div>
          <div style="color:#fff;font-weight:700;font-size:17px;font-family:'Playfair Display',serif;">BookIt</div>
          <div style="color:#78716C;font-size:11px;">Restaurant Reservations</div>
        </div>
      </div>

      <!-- Nav -->
      <nav style="padding:16px 12px;flex:1;">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:9px;margin-bottom:4px;font-size:14px;text-decoration:none;transition:all 0.15s;"
          :style="route.path === link.to
            ? 'background:#292524;color:#FCD34D;font-weight:600;'
            : 'color:#A8A29E;font-weight:400;'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- User footer -->
      <div style="padding:16px 12px;border-top:1px solid #292524;">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:8px;">
          <div style="width:32px;height:32px;background:#D97706;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">
            {{ initial }}
          </div>
          <div>
            <div style="color:#E7E5E4;font-size:13px;font-weight:600;">{{ auth.user?.name }}</div>
            <div style="color:#78716C;font-size:11px;text-transform:capitalize;">{{ auth.user?.role }}</div>
          </div>
        </div>
        <button
          @click="auth.logout()"
          style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;border-radius:9px;background:transparent;color:#78716C;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;"
        >
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main style="flex:1;margin-left:240px;padding:32px 36px;min-height:100vh;">
      <slot />
    </main>

  </div>
</template>