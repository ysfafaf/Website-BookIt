<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const links = computed(() => {
  if (auth.isAdmin || auth.isStaff) {
    return [
      { label: 'Reservations', to: '/admin' },
      { label: 'Tables', to: '/admin/tables' },
    ]
  }
  return [
    { label: 'My Reservations', to: '/dashboard' },
    { label: 'Book a Table',    to: '/dashboard/reserve' },
  ]
})
</script>

<template>
  <nav class="bg-neutral-950 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <NuxtLink to="/" class="text-xl font-bold text-amber-600">BookIt</NuxtLink>

    <div class="flex items-center gap-6">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="text-sm text-neutral-50 hover:text-amber-600 transition-colors"
        :class="{ 'text-amber-600 font-medium': route.path === link.to }"
      >
        {{ link.label }}
      </NuxtLink>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-sm text-neutral-50">{{ auth.user?.name }}</span>
      <span class="text-xs bg-amber-600 text-neutral-50 px-2 py-0.5 rounded-full capitalize">
        {{ auth.user?.role }}
      </span>
      <button @click="auth.logout()" class="text-sm text-red-500 hover:text-red-700">
        Logout
      </button>
    </div>
  </nav>
</template>