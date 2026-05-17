export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.isLoggedIn) return navigateTo('/login')

  if (to.path.startsWith('/admin') && !auth.isAdmin) {
    if (auth.isStaff) return navigateTo('/staff')
    return navigateTo('/dashboard')
  }
})