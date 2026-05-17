<script setup lang="ts">
const props = defineProps<{ status: string }>()

const config: Record<string, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', classes: 'bg-green-100 text-green-800'  },
  rejected:  { label: 'Rejected',  classes: 'bg-red-100 text-red-800'      },
  completed: { label: 'Completed', classes: 'bg-blue-100 text-blue-800'    },
  cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600'    },
}

const badge = computed(() => config[props.status] ?? { label: props.status, classes: 'bg-gray-100 text-gray-600' })
</script>

<template>
  <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', badge.classes]">
    {{ badge.label }}
  </span>
</template>