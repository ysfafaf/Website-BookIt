<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const store  = useUsersStore()
const api    = useApi()
const search = ref('')
const showModal = ref(false)
const formError = ref('')
const formLoading = ref(false)

const newUser = reactive({
  name: '',
  email: '',
  password: '',
  phone_number: '',
  role: 'staff' as 'staff' | 'admin'  // ← only staff or admin
})

const roleColors: Record<string, string> = {
  admin:    'background:#EDE9FE;color:#5B21B6;',
  staff:    'background:#DCFCE7;color:#166534;',
  customer: 'background:#FEF3C7;color:#92400E;',
}

onMounted(() => store.fetchAll())

let timer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => store.fetchAll({ search: search.value }), 400)
})

const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Delete user "${name}"?`)) return
  await store.remove(id)
}

const handleRoleChange = async (id: string, role: string) => {
  await store.updateRole(id, role)
}

const openModal = () => {
  formError.value = ''
  newUser.name = ''
  newUser.email = ''
  newUser.password = ''
  newUser.phone_number = ''
  newUser.role = 'staff'
  showModal.value = true
}

const createUser = async () => {
  formError.value = ''
  if (!newUser.name || !newUser.email || !newUser.password) {
    formError.value = 'Name, email and password are required.'
    return
  }
  formLoading.value = true
  try {
    // Register the user
    await api.post('/auth/register', {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      phone_number: newUser.phone_number || undefined
    })

    // Promote role if not customer
    if (newUser.role !== 'customer') {
      const users = await api.get('/users', { search: newUser.email })
      const created = users.items?.[0]
      if (created) {
        await api.patch(`/users/${created.id}/role`, { role: newUser.role })
      }
    }

    showModal.value = false
    await store.fetchAll()
  } catch (err: any) {
    formError.value = err.message || 'Failed to create user.'
  } finally {
    formLoading.value = false
  }
}
</script>

<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0;">
          User Management
        </h1>
        <p style="margin:4px 0 0;color:#78716C;font-size:14px;">
          {{ store.pagination?.total ?? 0 }} registered users
        </p>
      </div>
      <button @click="openModal"
        style="display:inline-flex;align-items:center;gap:6px;background:#D97706;color:#fff;padding:10px 20px;border:none;border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;">
        + Add Staff / Admin
      </button>
    </div>

    <!-- Search -->
    <div style="margin-bottom:20px;">
      <input
        v-model="search"
        placeholder="Search by name or email…"
        style="width:100%;max-width:360px;padding:9px 12px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#fff;"
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loading">
      <div v-for="i in 4" :key="i"
        style="height:52px;background:#fff;border-radius:8px;margin-bottom:8px;border:1px solid #E5E7EB;">
      </div>
    </div>

    <!-- Table -->
    <div v-else style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
      <div v-if="store.users.length === 0"
        style="text-align:center;padding:48px;color:#78716C;">
        No users found.
      </div>

      <table v-else style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#FAFAF9;">
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">User</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Email</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Phone</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Role</th>
            <th style="padding:12px 16px;font-size:12px;font-weight:600;color:#6B7280;text-align:left;border-bottom:1px solid #E5E7EB;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in store.users" :key="u.id"
            style="border-bottom:1px solid #F5F5F4;">
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:34px;height:34px;background:#FEF3C7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#92400E;flex-shrink:0;">
                  {{ u.name.charAt(0).toUpperCase() }}
                </div>
                <span style="font-size:14px;font-weight:500;color:#1C1917;">{{ u.name }}</span>
              </div>
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#6B7280;">{{ u.email }}</td>
            <td style="padding:12px 16px;font-size:13px;color:#6B7280;">{{ u.phone_number || '—' }}</td>
            <td style="padding:12px 16px;">
              <select
                :value="u.role"
                @change="handleRoleChange(u.id, ($event.target as HTMLSelectElement).value)"
                :style="roleColors[u.role] || ''"
                style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;border:none;cursor:pointer;font-family:inherit;text-transform:capitalize;outline:none;"
              >
                <option value="customer">customer</option>
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td style="padding:12px 16px;">
              <button
                @click="handleDelete(u.id, u.name)"
                style="background:#FEE2E2;color:#991B1B;border:none;border-radius:7px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Add User Modal ── -->
    <div v-if="showModal"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,0.2);">

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0;">
            Add Staff / Admin
          </h2>
          <button @click="showModal = false"
            style="background:none;border:none;font-size:20px;cursor:pointer;color:#78716C;line-height:1;">
            ×
          </button>
        </div>

        <!-- Notice -->
        <div style="background:#FEF3C7;border-radius:9px;padding:10px 14px;font-size:13px;color:#92400E;margin-bottom:20px;">
          ℹ️ Customers register themselves. This form is for creating <strong>staff</strong> or <strong>admin</strong> accounts only.
        </div>

        <!-- Error -->
        <div v-if="formError"
          style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
          {{ formError }}
        </div>

        <!-- Name -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Full name <span style="color:#D97706;">*</span>
          </label>
          <input v-model="newUser.name" type="text" placeholder="John Doe"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;" />
        </div>

        <!-- Email -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Email <span style="color:#D97706;">*</span>
          </label>
          <input v-model="newUser.email" type="email" placeholder="staff@bookit.com"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;" />
        </div>

        <!-- Phone -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Phone number
          </label>
          <input v-model="newUser.phone_number" type="tel" placeholder="+62 812-xxxx-xxxx"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;" />
        </div>

        <!-- Password -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Password <span style="color:#D97706;">*</span>
          </label>
          <input v-model="newUser.password" type="password" placeholder="Min. 6 characters"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;" />
        </div>

        <!-- Role — only staff or admin -->
        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Role <span style="color:#D97706;">*</span>
          </label>
          <select v-model="newUser.role"
            style="width:100%;padding:10px 14px;border:1px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Buttons -->
        <div style="display:flex;gap:10px;">
          <button @click="showModal = false"
            style="flex:1;padding:10px;border:1px solid #E5E7EB;border-radius:9px;background:transparent;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
            Cancel
          </button>
          <button
            :disabled="formLoading"
            @click="createUser"
            style="flex:1;padding:10px;background:#D97706;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;"
            :style="formLoading ? 'opacity:0.6;cursor:not-allowed;' : ''"
          >
            {{ formLoading ? 'Creating...' : 'Create Account' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>