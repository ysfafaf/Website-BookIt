<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'default' })

const api   = useApi()
const store = useReservationStore()

const step         = ref(1)
const date         = ref('')
const time         = ref('')
const tableTypes   = ref<any[]>([])
const selectedType = ref<any>(null)
const description  = ref('')
const loading      = ref(false)
const error        = ref('')
const success      = ref(false)

const today = new Date().toISOString().split('T')[0]

const canProceedStep1 = computed(() => date.value && time.value)

const fetchAvailable = async () => {
  error.value   = ''
  loading.value = true
  try {
    tableTypes.value = await api.get('/table-types/available', {
      date: date.value,
      time: time.value
    })
    step.value = 2
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const selectType = (type: any) => {
  selectedType.value = type
  step.value = 3
}

const submit = async () => {
  error.value   = ''
  loading.value = true
  try {
    await store.create({
      table_type_id: selectedType.value.id,
      date: date.value,
      time: time.value,
      description: description.value
    })
    success.value = true
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  step.value         = 1
  date.value         = ''
  time.value         = ''
  selectedType.value = null
  description.value  = ''
  success.value      = false
  error.value        = ''
}

const stepLabels = ['Date & Time', 'Table Type', 'Notes', 'Confirm']

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

const typeDesc: Record<string, string> = {
  'Small Table':  'Perfect for couples or small groups',
  'Medium Table': 'Great for family dinners or lunches',
  'Large Table':  'Ideal for parties and large gatherings'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric'
  })
</script>

<template>
  <div style="min-height:100%;display:flex;flex-direction:column;align-items:center;padding:8px 0 48px;">

    <!-- ── Page heading ── -->
    <div style="width:100%;max-width:620px;margin-bottom:28px;">
      <h1 style="font-size:24px;font-weight:700;color:#1C1917;font-family:'Playfair Display',serif;margin:0 0 4px;">
        Make a Reservation
      </h1>
      <p style="margin:0;color:#78716C;font-size:14px;">
        Follow the steps below to book your table
      </p>
    </div>

    <!-- ── Step indicator ── -->
    <div v-if="!success"
      style="width:100%;max-width:620px;margin-bottom:28px;">
      <div style="display:flex;align-items:center;">
        <template v-for="(label, idx) in stepLabels" :key="idx">

          <!-- Step circle + label -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;">
            <div
              :style="step > idx + 1
                ? 'width:32px;height:32px;border-radius:50%;background:#D97706;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;'
                : step === idx + 1
                  ? 'width:32px;height:32px;border-radius:50%;background:#D97706;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;box-shadow:0 0 0 4px #FEF3C7;'
                  : 'width:32px;height:32px;border-radius:50%;background:#E5E7EB;color:#9CA3AF;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;'"
            >
              {{ step > idx + 1 ? '✓' : idx + 1 }}
            </div>
            <span
              :style="step === idx + 1
                ? 'font-size:11px;font-weight:600;color:#D97706;white-space:nowrap;'
                : step > idx + 1
                  ? 'font-size:11px;font-weight:500;color:#78716C;white-space:nowrap;'
                  : 'font-size:11px;color:#9CA3AF;white-space:nowrap;'"
            >
              {{ label }}
            </span>
          </div>

          <!-- Connector line -->
          <div v-if="idx < stepLabels.length - 1"
            style="flex:1;margin:0 8px;margin-bottom:18px;"
          >
            <div
              :style="step > idx + 1
                ? 'height:2px;background:#D97706;border-radius:2px;'
                : 'height:2px;background:#E5E7EB;border-radius:2px;'"
            ></div>
          </div>

        </template>
      </div>
    </div>

    <!-- ── Error banner ── -->
    <div v-if="error"
      style="width:100%;max-width:620px;background:#FEE2E2;color:#991B1B;font-size:13px;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      ⚠️ {{ error }}
    </div>

    <!-- ════════════════════════════════════════
         STEP 1 — Date & Time
    ════════════════════════════════════════ -->
    <div v-if="step === 1"
      style="width:100%;max-width:620px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">

      <div style="margin-bottom:24px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0 0 4px;">
          Select Date & Time
        </h2>
        <p style="margin:0;font-size:13px;color:#78716C;">
          Choose when you'd like to dine with us
        </p>
      </div>

      <!-- Date input -->
      <div style="margin-bottom:24px;">
        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">
          Date <span style="color:#D97706;">*</span>
        </label>
        <input
          v-model="date"
          type="date"
          :min="today"
          style="width:100%;padding:11px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;transition:border-color 0.15s;"
          :style="date ? 'border-color:#D97706;' : ''"
          @focus="($event.target as HTMLInputElement).style.borderColor = '#D97706'"
          @blur="($event.target as HTMLInputElement).style.borderColor = date ? '#D97706' : '#E5E7EB'"
        />
        <p v-if="date" style="margin:6px 0 0;font-size:12px;color:#D97706;font-weight:500;">
           {{ formatDate(date) }}
        </p>
      </div>

      <!-- Time slot picker -->
      <div style="margin-bottom:28px;">
        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">
          Time <span style="color:#D97706;">*</span>
        </label>
        <TimeSlotPicker v-model="time" />
      </div>

      <!-- Continue button -->
      <button
        :disabled="!canProceedStep1 || loading"
        @click="fetchAvailable"
        style="width:100%;padding:13px;background:#D97706;color:#fff;border:none;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity 0.15s;"
        :style="!canProceedStep1 || loading ? 'opacity:0.5;cursor:not-allowed;' : 'opacity:1;'"
      >
        <span>{{ loading ? 'Checking availability...' : 'Check Availability' }}</span>
        <span v-if="!loading">→</span>
      </button>

    </div>

    <!-- ════════════════════════════════════════
         STEP 2 — Table Type
    ════════════════════════════════════════ -->
    <div v-if="step === 2"
      style="width:100%;max-width:620px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">

      <div style="margin-bottom:6px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0 0 4px;">
          Choose Table Type
        </h2>
        <p style="margin:0;font-size:13px;color:#78716C;">
          Showing available tables for
          <strong style="color:#1C1917;">{{ formatDate(date) }}</strong>
          at <strong style="color:#1C1917;">{{ time }}</strong>
        </p>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#F5F5F4;margin:20px 0;"></div>

      <!-- No tables available -->
      <div v-if="tableTypes.length === 0"
        style="text-align:center;padding:40px 20px;">
        <p style="font-size:36px;margin-bottom:12px;"></p>
        <p style="font-weight:700;color:#1C1917;font-size:16px;margin-bottom:6px;">No tables available</p>
        <p style="color:#78716C;font-size:14px;margin-bottom:20px;">
          All tables are booked for this time. Please try a different date or time.
        </p>
        <button @click="step = 1"
          style="padding:10px 24px;background:#D97706;color:#fff;border:none;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;">
          ← Try Another Time
        </button>
      </div>

      <!-- Table type cards -->
      <div v-else style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
        <button
          v-for="type in tableTypes"
          :key="type.id"
          @click="selectType(type)"
          style="display:flex;align-items:center;gap:16px;padding:16px 18px;border:1.5px solid #E5E7EB;border-radius:12px;background:#fff;cursor:pointer;text-align:left;width:100%;font-family:'DM Sans',sans-serif;transition:all 0.15s;"
          @mouseenter="(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#D97706'
            ;(e.currentTarget as HTMLElement).style.background = '#FFFBEB'
          }"
          @mouseleave="(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
            ;(e.currentTarget as HTMLElement).style.background = '#fff'
          }"
        >
          <!-- Icon -->
          <div style="width:48px;height:48px;border-radius:12px;background:#FEF3C7;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">
            {{ typeIcon[type.name] ?? '' }}
          </div>

          <!-- Info -->
          <div style="flex:1;">
            <div style="font-weight:700;font-size:15px;color:#1C1917;margin-bottom:2px;">
              {{ type.name }}
            </div>
            <div style="font-size:13px;color:#92400E;font-weight:600;margin-bottom:2px;">
              {{ typeCapacity[type.name] ?? '' }}
            </div>
            <div style="font-size:12px;color:#78716C;">
              {{ typeDesc[type.name] ?? '' }}
            </div>
          </div>

          <!-- Available badge -->
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
            <span style="background:#D1FAE5;color:#065F46;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap;">
              ✓ Available
            </span>
            <span style="font-size:12px;color:#78716C;">Tap to select →</span>
          </div>
        </button>
      </div>

      <!-- Back button -->
      <button v-if="tableTypes.length > 0" @click="step = 1"
        style="width:100%;padding:11px;border:1.5px solid #E5E7EB;border-radius:10px;background:transparent;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
        ← Back
      </button>

    </div>

    <!-- ════════════════════════════════════════
         STEP 3 — Notes
    ════════════════════════════════════════ -->
    <div v-if="step === 3"
      style="width:100%;max-width:620px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">

      <div style="margin-bottom:24px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0 0 4px;">
          Special Requests
        </h2>
        <p style="margin:0;font-size:13px;color:#78716C;">
          Let us know if you have any special requirements (optional)
        </p>
      </div>

      <!-- Selection summary chip -->
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
        <span style="display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;">
           {{ date }}
        </span>
        <span style="display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;">
           {{ time }}
        </span>
        <span style="display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;">
          {{ typeIcon[selectedType?.name] ?? '' }} {{ selectedType?.name }}
        </span>
      </div>

      <!-- Notes textarea -->
      <div style="margin-bottom:28px;">
        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">
          Notes / Description
        </label>
        <textarea
          v-model="description"
          rows="4"
          placeholder="e.g. Anniversary dinner, need high chair, window seat preferred, allergy info..."
          style="width:100%;padding:12px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;resize:vertical;outline:none;background:#FAFAF9;color:#1C1917;box-sizing:border-box;line-height:1.6;transition:border-color 0.15s;"
          @focus="($event.target as HTMLTextAreaElement).style.borderColor = '#D97706'"
          @blur="($event.target as HTMLTextAreaElement).style.borderColor = '#E5E7EB'"
        ></textarea>
        <p style="margin:6px 0 0;font-size:12px;color:#9CA3AF;">
          {{ description.length }}/500 characters
        </p>
      </div>

      <!-- Buttons -->
      <div style="display:flex;gap:12px;">
        <button @click="step = 2"
          style="flex:1;padding:12px;border:1.5px solid #E5E7EB;border-radius:10px;background:transparent;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
          ← Back
        </button>
        <button @click="step = 4"
          style="flex:2;padding:12px;background:#D97706;color:#fff;border:none;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;">
          Continue →
        </button>
      </div>

    </div>

    <!-- ════════════════════════════════════════
         STEP 4 — Confirm
    ════════════════════════════════════════ -->
    <div v-if="step === 4 && !success"
      style="width:100%;max-width:620px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">

      <div style="margin-bottom:24px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917;margin:0 0 4px;">
          Confirm Reservation
        </h2>
        <p style="margin:0;font-size:13px;color:#78716C;">
          Please review your booking details before confirming
        </p>
      </div>

      <!-- Summary card -->
      <div style="background:#FAFAF9;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <div
          v-for="(row, idx) in [
            { icon: '', label: 'Date',       value: formatDate(date) },
            { icon: '', label: 'Time',       value: time },
            { icon: '', label: 'Table Type', value: selectedType?.name },
            { icon: '', label: 'Capacity',   value: selectedType ? typeCapacity[selectedType.name] : '' },
            { icon: '', label: 'Notes',      value: description || 'No special requests' }
          ]"
          :key="row.label"
          style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;"
          :style="idx < 4 ? 'border-bottom:1px solid #E5E7EB;' : ''"
        >
          <span style="font-size:16px;margin-top:1px;flex-shrink:0;">{{ row.icon }}</span>
          <span style="font-size:13px;color:#78716C;width:90px;flex-shrink:0;padding-top:1px;">
            {{ row.label }}
          </span>
          <span style="font-size:13px;font-weight:600;color:#1C1917;flex:1;">
            {{ row.value }}
          </span>
        </div>
      </div>

      <!-- Auto-assign notice -->
      <div style="display:flex;align-items:flex-start;gap:10px;background:#FEF3C7;border-radius:10px;padding:12px 16px;margin-bottom:24px;">
        <span style="font-size:16px;flex-shrink:0;"></span>
        <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5;">
          The system will automatically assign the best available table for you.
          Your reservation status will be <strong>pending</strong> until confirmed by our team.
        </p>
      </div>

      <!-- Buttons -->
      <div style="display:flex;gap:12px;">
        <button @click="step = 3"
          style="flex:1;padding:12px;border:1.5px solid #E5E7EB;border-radius:10px;background:transparent;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
          ← Back
        </button>
        <button
          :disabled="loading"
          @click="submit"
          style="flex:2;padding:12px;background:#D97706;color:#fff;border:none;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;"
          :style="loading ? 'opacity:0.6;cursor:not-allowed;' : ''"
        >
          {{ loading ? 'Confirming...' : 'Confirm Booking' }}
        </button>
      </div>

    </div>

    <!-- ════════════════════════════════════════
         SUCCESS STATE
    ════════════════════════════════════════ -->
    <div v-if="success"
      style="width:100%;max-width:620px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:48px 40px;box-shadow:0 1px 8px rgba(0,0,0,0.04);text-align:center;">

      <!-- Success icon -->
      <div style="width:72px;height:72px;background:#D1FAE5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px;">
        ✓
      </div>

      <h2 style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#1C1917;margin:0 0 8px;">
        Reservation Submitted!
      </h2>
      <p style="color:#78716C;font-size:15px;margin:0 0 4px;">
        Your reservation for <strong style="color:#1C1917;">{{ formatDate(date) }}</strong>
      </p>
      <p style="color:#78716C;font-size:15px;margin:0 0 24px;">
        at <strong style="color:#1C1917;">{{ time }}</strong> is pending confirmation.
      </p>

      <!-- Mini summary -->
      <div style="background:#FAFAF9;border-radius:10px;padding:14px 18px;margin-bottom:28px;text-align:left;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#78716C;">Table type</span>
          <span style="font-size:13px;font-weight:600;color:#1C1917;">{{ selectedType?.name }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#78716C;">Capacity</span>
          <span style="font-size:13px;font-weight:600;color:#1C1917;">
            {{ selectedType ? typeCapacity[selectedType.name] : '' }}
          </span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#78716C;">Status</span>
          <span style="font-size:13px;font-weight:600;background:#FEF3C7;color:#92400E;padding:2px 10px;border-radius:20px;">
            Pending
          </span>
        </div>
      </div>

      <p style="color:#78716C;font-size:13px;margin:0 0 24px;">
        We'll notify you once our team confirms your booking.
      </p>

      <!-- Action buttons -->
      <div style="display:flex;gap:12px;">
        <NuxtLink
          to="/dashboard/reservations"
          style="flex:1;padding:12px;border:1.5px solid #E5E7EB;border-radius:10px;color:#6B7280;font-size:14px;font-weight:600;text-decoration:none;text-align:center;"
        >
          View My Reservations
        </NuxtLink>
        <button
          @click="resetForm"
          style="flex:1;padding:12px;background:#D97706;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;"
        >
          New Reservation
        </button>
      </div>

    </div>

  </div>
</template>