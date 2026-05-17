<script setup lang="ts">
definePageMeta({
  layout: false  // ← no sidebar on register page
})

const api = useApi()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone_number: ''
})
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  if (!form.name || !form.email || !form.password) {
    error.value = 'Name, email and password are required.'
    return
  }
  loading.value = true
  try {
    await api.post('/auth/register', form)
    await auth.login(form.email, form.password)
    navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#E8E8E8;font-family:'DM Sans',sans-serif;">
    <div style="width:100%;max-width:440px;padding:24px;">

      <!-- Logo -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <div style="width:40px;height:40px;background:#D97706;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:700;font-size:18px;font-family:'Playfair Display',serif;">B</span>
        </div>
        <span style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;">BookIt</span>
      </div>

      <!-- Card -->
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:32px;">
        <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;">Create account</h2>
        <p style="margin:0 0 24px;color:#78716C;font-size:14px;">Join BookIt to start making reservations</p>

        <!-- Error -->
        <div v-if="error"
          style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
          {{ error }}
        </div>

        <!-- Name -->
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">Full name <span style="color:#D97706;">*</span></label>
          <input v-model="form.name" type="text" placeholder="John Doe"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;" />
        </div>

        <!-- Email -->
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">Email address <span style="color:#D97706;">*</span></label>
          <input v-model="form.email" type="email" placeholder="you@example.com"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;" />
        </div>

        <!-- Phone -->
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">Phone number</label>
          <input v-model="form.phone_number" type="tel" placeholder="+62 812-xxxx-xxxx"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;" />
        </div>

        <!-- Password -->
        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">Password <span style="color:#D97706;">*</span></label>
          <input v-model="form.password" type="password" placeholder="Min. 6 characters"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;"
            @keyup.enter="submit" />
        </div>

        <!-- Submit -->
        <button
          :disabled="loading"
          @click="submit"
          style="width:100%;background:#D97706;color:#fff;padding:13px;border:none;border-radius:9px;font-weight:600;font-size:15px;cursor:pointer;font-family:inherit;"
          :style="loading ? 'opacity:0.6;cursor:not-allowed;' : ''"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <p style="text-align:center;margin-top:16px;font-size:14px;color:#78716C;">
          Already have an account?
          <NuxtLink to="/login" style="color:#D97706;font-weight:600;text-decoration:none;">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>