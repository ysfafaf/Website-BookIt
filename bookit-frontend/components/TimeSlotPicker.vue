<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Generate 30-min slots from 10:00 to 21:00 only
const slots = computed(() => {
  const result: string[] = []
  for (let h = 10; h <= 21; h++) {
    result.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 21) result.push(`${String(h).padStart(2, '0')}:30`)
  }
  return result
})

// slots will be:
// 10:00, 10:30, 11:00, 11:30 ... 20:00, 20:30, 21:00

const select = (slot: string) => {
  emit('update:modelValue', slot)
}
</script>

<template>
  <div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      <button
        v-for="slot in slots"
        :key="slot"
        type="button"
        @click="select(slot)"
        :style="modelValue === slot
          ? 'padding:8px 4px;border:1.5px solid #D97706;border-radius:8px;background:#FEF3C7;color:#92400E;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;'
          : 'padding:8px 4px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;color:#374151;font-size:13px;cursor:pointer;font-family:inherit;'"
      >
        {{ slot }}
      </button>
    </div>
    <p v-if="!modelValue"
      style="font-size:12px;color:#9CA3AF;margin-top:8px;">
      Select a time slot above
    </p>
    <p v-else
      style="font-size:12px;color:#D97706;font-weight:600;margin-top:8px;">
      ✓ Selected: {{ modelValue }}
    </p>
  </div>
</template>