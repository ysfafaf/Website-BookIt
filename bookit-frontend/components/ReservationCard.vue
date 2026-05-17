<script setup lang="ts">
defineProps<{
  reservation: {
    id: string
    date: string
    time: string
    status: string
    description?: string
    table: { table_number: number; table_type_name: string }
    user?: { name: string; email: string }
  }
  showUser?: boolean   // true in admin view
  showActions?: boolean
}>()

const emit = defineEmits(['cancel', 'confirm', 'reject', 'complete'])

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

const formatTime = (t: string) => {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="font-semibold text-gray-900">
          Table {{ reservation.table.table_number }}
          <span class="text-gray-400 font-normal text-sm">· {{ reservation.table.table_type_name }}</span>
        </p>
        <p v-if="showUser && reservation.user" class="text-sm text-gray-500 mt-0.5">
          {{ reservation.user.name }} · {{ reservation.user.email }}
        </p>
      </div>
      <StatusBadge :status="reservation.status" />
    </div>

    <!-- Date & Time -->
    <div class="flex gap-4 text-sm text-gray-600 mb-3">
      <span> {{ formatDate(reservation.date) }}</span>
      <span> {{ formatTime(reservation.time) }}</span>
    </div>

    <!-- Notes -->
    <p v-if="reservation.description" class="text-sm text-gray-500 italic mb-3">
      "{{ reservation.description }}"
    </p>

    <!-- Actions -->
    <div v-if="showActions" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">

      <!-- Customer: cancel -->
      <button
        v-if="['pending','confirmed'].includes(reservation.status)"
        @click="emit('cancel', reservation.id)"
        class="btn-danger-sm bg-red-200/50 text-red-600 hover:bg-red-300/50"
      >
        Cancel
      </button>

      <!-- Admin: confirm / reject -->
      <template v-if="reservation.status === 'pending'">
        <button @click="emit('confirm', reservation.id)" class="btn-success-sm bg-green-200/50 text-green-600 hover:bg-green-300/50">Confirm</button>
        <button @click="emit('reject', reservation.id)"  class="btn-danger-sm bg-red-200/50 text-red-600 hover:bg-red-300/50">Reject</button>
      </template>

      <!-- Admin/Staff: complete -->
      <button
        v-if="reservation.status === 'confirmed'"
        @click="emit('complete', reservation.id)"
        class="btn-primary-sm"
      >
        Mark Complete
      </button>

    </div>
  </div>
</template>