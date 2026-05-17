<script setup lang="ts">
definePageMeta({
  layout: false  // ← no sidebar on login page
})

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    if (auth.isAdmin || auth.isStaff) return navigateTo('/admin')
    return navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#E8E8E8;font-family:'DM Sans',sans-serif;">
    <div style="display:flex;width:100%;max-width:1000px;min-height:600px;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.12);">

      <!-- Form side -->
      <div style="flex:1;background:#FAFAF9;display:flex;align-items:center;justify-content:center;padding:48px;">
        <div style="width:100%;max-width:380px;">

          <!-- Logo -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:36px;">
            <div style="width:40px;height:40px;background:#D97706;border-radius:10px;display:flex;align-items:center;justify-content:center;">
              <span style="color:#fff;font-weight:700;font-size:18px;font-family:'Playfair Display',serif;">B</span>
            </div>
            <span style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;">BookIt</span>
          </div>

          <h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;">Welcome back</h2>
          <p style="margin:0 0 28px;color:#78716C;font-size:15px;">Sign in to manage your reservations</p>

          <!-- Error -->
          <div v-if="error"
            style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
            {{ error }}
          </div>

          <!-- Email -->
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
              Email address <span style="color:#D97706;">*</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#fff;color:#1C1917;box-sizing:border-box;"
            />
          </div>

          <!-- Password -->
          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
              Password <span style="color:#D97706;">*</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#fff;color:#1C1917;box-sizing:border-box;"
              @keyup.enter="submit"
            />
          </div>

          <!-- Submit -->
          <button
            :disabled="loading"
            @click="submit"
            style="width:100%;background:#D97706;color:#fff;padding:13px 28px;border:none;border-radius:9px;font-weight:600;font-size:15px;cursor:pointer;font-family:inherit;transition:opacity 0.15s;"
            :style="loading ? 'opacity:0.6;cursor:not-allowed;' : ''"
          >
            {{ loading ? 'Signing in...' : 'Sign In →' }}
          </button>

          <p style="text-align:center;margin-top:20px;font-size:14px;color:#78716C;">
            No account?
            <NuxtLink to="/register" style="color:#D97706;font-weight:600;text-decoration:none;">Register here</NuxtLink>
          </p>
        </div>
      </div>

      <!-- Promo side -->
      <div style="width:45%;background:#1C1917;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-60px;right:-60px;width:300px;height:300px;border:1px solid #292524;border-radius:50%;"></div>
        <div style="position:absolute;bottom:-80px;left:-40px;width:240px;height:240px;border:1px solid #292524;border-radius:50%;"></div>
        <div style="position:relative;z-index:1;text-align:center;">
          <div style="font-size:56px;margin-bottom:16px;"></div>
          <h3 style="color:#fff;font-family:'Playfair Display',serif;font-size:28px;font-weight:700;margin:0 0 12px;">Reserve Your Perfect Table</h3>
          
          <div style="display:flex;gap:12px;margin-top:28px;justify-content:center;flex-wrap:wrap;">
            
          </div>
        </div>
      </div>

    </div>
  </div>
</template>