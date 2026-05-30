<script setup lang="ts">
const auth  = useAuthStore()
const route = useRoute()

const mobileMenuOpen = ref(false)

const customerLinks = [
  { label: 'Home',             to: '/dashboard' },
  { label: 'Book a Table',     to: '/dashboard/reserve'},
  { label: 'My Reservations',  to: '/dashboard/reservations' },
]

const adminLinks = [
  { label: 'Dashboard',    to: '/admin' },
  { label: 'Reservations', to: '/admin/reservations' },
  { label: 'Tables',       to: '/admin/tables' },
  { label: 'Users',        to: '/admin/users', },
]

const staffLinks = [
  { label: 'Dashboard', to: '/staff' },
]

const links = computed(() => {
  if (auth.isAdmin)  return adminLinks
  if (auth.isStaff)  return staffLinks
  return customerLinks
})

const initial = computed(() =>
  auth.user?.name?.charAt(0).toUpperCase() || '?'
)

const isActive = (path: string) => route.path === path

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div style="display:flex;min-height:100vh;background:#F5F5F4;font-family:'DM Sans',sans-serif;">

    <!-- ══════════════════════════════════════
         DESKTOP SIDEBAR (hidden on mobile)
    ══════════════════════════════════════ -->
    <aside class="desktop-sidebar">

      <!-- Brand -->
      <div style="padding:24px 20px 20px;border-bottom:1px solid #292524;display:flex;align-items:center;gap:10px;flex-shrink:0;">
        <div style="width:50px;height:50px;background:transparent;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:#fff;font-weight:700;font-size:18px;font-family:'Playfair Display',serif;"> <img  src="/logo3.png" alt="Halo"/></span>
          </div>
        <div>
          <div style="color:#fff;font-weight:700;font-size:17px;font-family:'Playfair Display',serif;letter-spacing:0.02em;">BookIt</div>
          <div style="color:#78716C;font-size:11px;">Restaurant Reservations</div>
        </div>
      </div>

      <!-- Nav links -->
      <nav style="padding:16px 12px;flex:1;overflow-y:auto;">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;margin-bottom:4px;font-size:14px;text-decoration:none;transition:all 0.15s;"
          :style="isActive(link.to)
            ? 'background:#292524;color:#FCD34D;font-weight:600;'
            : 'color:#A8A29E;font-weight:400;'"
        >
          <span style="font-size:16px;">{{ link.icon }}</span>
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- User footer -->
      <div style="padding:16px 12px;border-top:1px solid #292524;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:6px;">
          <div style="width:32px;height:32px;background:#D97706;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">
            {{ initial }}
          </div>
          <div style="min-width:0;">
            <div style="color:#E7E5E4;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              {{ auth.user?.name }}
            </div>
            <div style="color:#78716C;font-size:11px;text-transform:capitalize;">
              {{ auth.user?.role }}
            </div>
          </div>
        </div>
        <button
          @click="auth.logout()"
          style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;border-radius:9px;background:transparent;color:#78716C;font-size:13px;cursor:pointer;font-family:inherit;transition:color 0.15s;"
          @mouseenter="($event.target as HTMLElement).style.color='#E7E5E4'"
          @mouseleave="($event.target as HTMLElement).style.color='#78716C'"
        >
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>

    <!-- ══════════════════════════════════════
         MOBILE OVERLAY MENU
    ══════════════════════════════════════ -->
    <div
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:90;display:none;"
      class="mobile-overlay"
    ></div>

    <aside
      class="mobile-sidebar"
      :style="mobileMenuOpen
        ? 'transform:translateX(0);'
        : 'transform:translateX(-100%);'"
    >
      <!-- Brand -->
      <div style="padding:20px;border-bottom:1px solid #292524;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:#D97706;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-weight:700;font-size:14px;font-family:'Playfair Display',serif;">B</span>
          </div>
          <span style="color:#fff;font-weight:700;font-size:16px;font-family:'Playfair Display',serif;">BookIt</span>
        </div>
        <button
          @click="mobileMenuOpen = false"
          style="background:none;border:none;color:#78716C;font-size:22px;cursor:pointer;line-height:1;padding:4px;">
          ×
        </button>
      </div>

      <!-- Nav -->
      <nav style="padding:16px 12px;flex:1;">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;margin-bottom:6px;font-size:15px;text-decoration:none;transition:all 0.15s;"
          :style="isActive(link.to)
            ? 'background:#292524;color:#FCD34D;font-weight:600;'
            : 'color:#A8A29E;'"
        >
          <span style="font-size:18px;">{{ link.icon }}</span>
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- User footer -->
      <div style="padding:16px 12px;border-top:1px solid #292524;">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:8px;">
          <div style="width:36px;height:36px;background:#D97706;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">
            {{ initial }}
          </div>
          <div>
            <div style="color:#E7E5E4;font-size:14px;font-weight:600;">{{ auth.user?.name }}</div>
            <div style="color:#78716C;font-size:12px;text-transform:capitalize;">{{ auth.user?.role }}</div>
          </div>
        </div>
        <button
          @click="auth.logout()"
          style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;border:none;border-radius:10px;background:#292524;color:#78716C;font-size:14px;cursor:pointer;font-family:inherit;">
          ↩ Sign out
        </button>
      </div>
    </aside>

    <!-- ══════════════════════════════════════
         MAIN CONTENT AREA
    ══════════════════════════════════════ -->
    <div class="main-content">

      <!-- Mobile top bar -->
      <header class="mobile-topbar">
        <button
          @click="mobileMenuOpen = true"
          style="background:none;border:none;cursor:pointer;padding:4px;font-size:22px;color:#1C1917;line-height:1;">
          ☰
        </button>
        <span style="font-size:18px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;">
          BookIt
        </span>
        <div style="width:32px;height:32px;background:#D97706;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;">
          {{ initial }}
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <slot />
      </main>

      <!-- ══════════════════════════════════════
           MOBILE BOTTOM NAV BAR
      ══════════════════════════════════════ -->
      <nav class="bottom-nav">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          style="display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;flex:1;padding:8px 4px;transition:all 0.15s;"
          :style="isActive(link.to)
            ? 'color:#D97706;'
            : 'color:#9CA3AF;'"
        >
          <span style="font-size:20px;line-height:1;">{{ link.icon }}</span>
          <span style="font-size:10px;font-weight:600;white-space:nowrap;">
            {{ link.label.split(' ')[0] }}
          </span>
        </NuxtLink>
      </nav>

    </div>
  </div>
</template>

<style scoped>
/* ── Desktop sidebar ── */
.desktop-sidebar {
  width: 240px;
  background: #1C1917;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  overflow: hidden;
}

/* ── Mobile drawer sidebar ── */
.mobile-sidebar {
  width: 280px;
  background: #1C1917;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
  overflow: hidden;
}

/* ── Main content ── */
.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Mobile top bar ── */
.mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 40;
}

/* ── Page content ── */
.page-content {
  flex: 1;
  padding: 32px 36px;
  padding-bottom: 32px;
}

/* ── Bottom nav ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #E5E7EB;
  z-index: 50;
  padding: 4px 0;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ── Mobile overlay ── */
.mobile-overlay {
  display: none;
}

/* ════════════════════════════════════════
   TABLET (640px – 1024px)
════════════════════════════════════════ */
@media (max-width: 1024px) {
  .desktop-sidebar { display: none; }
  .main-content    { margin-left: 0; }
  .mobile-topbar   { display: flex; }
  .mobile-sidebar  { display: flex; }
  .mobile-overlay  { display: block; }
  .page-content    { padding: 20px 24px 100px; }
  .bottom-nav      { display: flex; }
}

/* ════════════════════════════════════════
   MOBILE (< 640px)
════════════════════════════════════════ */
@media (max-width: 640px) {
  .page-content { padding: 16px 16px 100px; }
}
</style>