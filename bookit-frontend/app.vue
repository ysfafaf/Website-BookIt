<script setup lang="ts">
const auth = useAuthStore()

onMounted(async () => {
  await auth.fetchMe()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>