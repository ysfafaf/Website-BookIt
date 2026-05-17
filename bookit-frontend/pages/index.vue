<script setup lang="ts">
definePageMeta({
  layout: false  // ← just a redirect, no layout needed
})

const auth = useAuthStore()

onMounted(async () => {
  await auth.fetchMe()
  if (!auth.isLoggedIn)             return navigateTo('/login')
  if (auth.isAdmin || auth.isStaff) return navigateTo('/admin')
  return navigateTo('/dashboard')
})
</script>

<template>
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#E8E8E8;">
    <p style="color:#78716C;font-size:14px;font-family:'DM Sans',sans-serif;">Redirecting...</p>
  </div>
</template>