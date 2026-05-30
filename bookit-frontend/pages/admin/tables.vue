<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const api = useApi()

interface TableType { id: string; name: string }
interface Table     { id: string; table_number: number; table_type_id: string; table_type_name: string }

const tables     = ref<Table[]>([])
const tableTypes = ref<TableType[]>([])
const loading    = ref(false)
const showModal  = ref(false)
const error      = ref('')
const success    = ref('')
const activeTab  = ref<'tables' | 'types'>('tables')

const newTable = reactive({ table_number: '', table_type_id: '' })
const newType  = reactive({ name: '' })

const typeIcon: Record<string, string> = {
  'Small Table':  'S',
  'Medium Table': 'M',
  'Large Table':  'L'
}

const typeCapacity: Record<string, string> = {
  'Small Table':  '2–4 people',
  'Medium Table': '5–7 people',
  'Large Table':  '8–10 people'
}

const fetchData = async () => {
  loading.value = true
  try {
    const [t, tt] = await Promise.all([
      api.get('/tables'),
      api.get('/table-types')
    ])
    tables.value     = t as Table[]
    tableTypes.value = tt as TableType[]
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const openAddModal = () => {
  error.value            = ''
  newTable.table_number  = ''
  newTable.table_type_id = tableTypes.value[0]?.id || ''
  showModal.value        = true
}

const createTable = async () => {
  error.value = ''
  if (!newTable.table_number || !newTable.table_type_id) {
    error.value = 'Table number and type are required.'
    return
  }
  try {
    await api.post('/tables', {
      table_number:   parseInt(newTable.table_number),
      table_type_id:  newTable.table_type_id
    })
    success.value   = 'Table added successfully.'
    showModal.value = false
    await fetchData()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to create table.'
  }
}

const deleteTable = async (id: string, num: number) => {
  if (!confirm(`Delete Table T${String(num).padStart(2,'0')}?`)) return
  try {
    await api.delete(`/tables/${id}`)
    success.value = 'Table deleted.'
    await fetchData()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message
    setTimeout(() => error.value = '', 3000)
  }
}

const createType = async () => {
  error.value = ''
  if (!newType.name.trim()) { error.value = 'Type name is required.'; return }
  try {
    await api.post('/table-types', { name: newType.name.trim() })
    success.value = 'Table type added.'
    newType.name  = ''
    await fetchData()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message
    setTimeout(() => error.value = '', 3000)
  }
}

const deleteType = async (id: string, name: string) => {
  if (!confirm(`Delete type "${name}"?`)) return
  try {
    await api.delete(`/table-types/${id}`)
    success.value = 'Table type deleted.'
    await fetchData()
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.message
    setTimeout(() => error.value = '', 3000)
  }
}
</script>

<template>
  <div>

    <!-- Header -->
    <div class="page-header-row">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0 0 4px;">
          Table Management
        </h1>
        <p style="margin:0;color:#78716C;font-size:14px;">
          {{ tables.length }} tables configured
        </p>
      </div>
      <button @click="openAddModal"
        style="display:inline-flex;align-items:center;gap:6px;background:#D97706;color:#fff;padding:10px 20px;border:none;border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;">
        + Add Table
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="success"
      style="background:#D1FAE5;color:#065F46;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
      ✓ {{ success }}
    </div>
    <div v-if="error"
      style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
      {{ error }}
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:24px;background:#F5F5F4;border-radius:10px;padding:4px;width:fit-content;">
      <button
        @click="activeTab = 'tables'"
        :style="activeTab === 'tables'
          ? 'padding:7px 20px;border-radius:8px;border:none;background:#fff;color:#1C1917;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 1px 4px rgba(0,0,0,0.08);'
          : 'padding:7px 20px;border-radius:8px;border:none;background:transparent;color:#78716C;font-size:14px;cursor:pointer;font-family:inherit;'"
      >
        Tables
      </button>
      <button
        @click="activeTab = 'types'"
        :style="activeTab === 'types'
          ? 'padding:7px 20px;border-radius:8px;border:none;background:#fff;color:#1C1917;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 1px 4px rgba(0,0,0,0.08);'
          : 'padding:7px 20px;border-radius:8px;border:none;background:transparent;color:#78716C;font-size:14px;cursor:pointer;font-family:inherit;'"
      >
        Table Types
      </button>
    </div>

    <!-- Tables tab -->
    <div v-if="activeTab === 'tables'">
      <div v-if="loading" class="grid-3">
        <div v-for="i in 6" :key="i"
          style="height:130px;background:#fff;border-radius:14px;border:1px solid #E5E7EB;">
        </div>
      </div>

      <div v-else-if="tables.length === 0"
        style="text-align:center;padding:64px 24px;background:#fff;border-radius:14px;border:1px solid #E5E7EB;">
        <p style="font-size:40px;margin-bottom:12px;">🪑</p>
        <p style="font-weight:600;color:#1C1917;font-size:16px;margin-bottom:6px;">No tables yet</p>
        <p style="color:#78716C;font-size:14px;margin-bottom:20px;">Add your first table to get started</p>
        <button @click="openAddModal"
          style="background:#D97706;color:#fff;padding:10px 24px;border:none;border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;">
          + Add Table
        </button>
      </div>

      <div v-else class="grid-3">
        <div
          v-for="table in tables"
          :key="table.id"
          style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;"
        >
          <!-- Top row -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
            <div style="width:40px;height:40px;background:#FEF3C7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">
              {{ typeIcon[table.table_type_name] ?? '🍽️' }}
            </div>
            <button
              @click="deleteTable(table.id, table.table_number)"
              style="background:none;border:none;cursor:pointer;color:#D1D5DB;padding:4px;border-radius:6px;font-size:16px;line-height:1;"
              @mouseenter="($event.target as HTMLElement).style.color='#EF4444'"
              @mouseleave="($event.target as HTMLElement).style.color='#D1D5DB'"
            >
              🗑
            </button>
          </div>

          <div style="font-size:22px;font-weight:700;color:#1C1917;margin-bottom:4px;font-family:'Playfair Display',serif;">
            T{{ String(table.table_number).padStart(2, '0') }}
          </div>
          <div style="font-size:13px;font-weight:600;color:#92400E;text-transform:capitalize;margin-bottom:4px;">
            {{ table.table_type_name }}
          </div>
          <div style="font-size:12px;color:#9CA3AF;">
            {{ typeCapacity[table.table_type_name] ?? '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Types tab -->
    <div v-if="activeTab === 'types'">
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;margin-bottom:16px;">
        <h3 style="margin:0 0 14px;font-size:15px;font-weight:600;color:#1C1917;">Add Table Type</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <input
            v-model="newType.name"
            placeholder="e.g. VIP Room, Outdoor Seat..."
            @keyup.enter="createType"
            style="flex:1;min-width:180px;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:9px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;"
          />
          <button @click="createType"
            style="padding:10px 20px;background:#D97706;color:#fff;border:none;border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;white-space:nowrap;">
            Add Type
          </button>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div
          v-for="tt in tableTypes"
          :key="tt.id"
          style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:14px 18px;flex-wrap:wrap;gap:10px;"
        >
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;background:#FEF3C7;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">
              {{ tt.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div style="font-size:14px;font-weight:600;color:#1C1917;">{{ tt.name }}</div>
              <div style="font-size:12px;color:#9CA3AF;">
                {{ typeCapacity[tt.name] ?? 'New type' }}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:12px;color:#78716C;">
              {{ tables.filter(t => t.table_type_name === tt.name).length }} tables
            </span>
            <button @click="deleteType(tt.id, tt.name)"
              style="background:#FEE2E2;color:#991B1B;border:none;border-radius:7px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
              Delete
            </button>
          </div>
        </div>

        <div v-if="tableTypes.length === 0"
          style="text-align:center;padding:40px;background:#fff;border-radius:14px;border:1px solid #E5E7EB;color:#78716C;">
          No table types yet.
        </div>
      </div>
    </div>

    <!-- Add Table Modal -->
    <div v-if="showModal"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;">
      <div style="background:#fff;border-radius:16px;padding:28px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(0,0,0,0.2);max-height:90vh;overflow-y:auto;">

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0;">
            Add New Table
          </h2>
          <button @click="showModal = false"
            style="background:none;border:none;font-size:22px;cursor:pointer;color:#78716C;line-height:1;">
            ×
          </button>
        </div>

        <div v-if="error"
          style="background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:9px;padding:10px 14px;margin-bottom:16px;">
          {{ error }}
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">
            Table Number <span style="color:#D97706;">*</span>
          </label>
          <input
            v-model="newTable.table_number"
            type="number"
            min="1"
            placeholder="e.g. 7"
            style="width:100%;padding:11px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:14px;font-family:inherit;outline:none;background:#FAFAF9;box-sizing:border-box;"
          />
        </div>

        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">
            Table Type <span style="color:#D97706;">*</span>
          </label>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label
              v-for="tt in tableTypes"
              :key="tt.id"
              :style="newTable.table_type_id === tt.id
                ? 'display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #D97706;border-radius:10px;background:#FEF3C7;cursor:pointer;'
                : 'display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #E5E7EB;border-radius:10px;background:#fff;cursor:pointer;'"
            >
              <input
                type="radio"
                :value="tt.id"
                v-model="newTable.table_type_id"
                style="accent-color:#D97706;flex-shrink:0;"
              />
              <span style="font-size:18px;">{{ typeIcon[tt.name] ?? '🍽️' }}</span>
              <div>
                <div style="font-size:14px;font-weight:600;color:#1C1917;">{{ tt.name }}</div>
                <div style="font-size:12px;color:#78716C;">{{ typeCapacity[tt.name] ?? '' }}</div>
              </div>
            </label>
          </div>
        </div>

        <div style="display:flex;gap:10px;">
          <button @click="showModal = false"
            style="flex:1;padding:11px;border:1.5px solid #E5E7EB;border-radius:10px;background:transparent;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
            Cancel
          </button>
          <button @click="createTable"
            style="flex:1;padding:11px;background:#D97706;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
            Add Table
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}
</style>