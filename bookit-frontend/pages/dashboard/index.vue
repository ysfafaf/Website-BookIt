<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'default' })
const auth = useAuthStore()
</script>

<template>
  <div>
    <!-- Hero -->
    <div style="background:#1C1917;border-radius:18px;padding:48px 40px;margin-bottom:28px;position:relative;overflow:hidden;">
      <div style="position:absolute;right:0;top:0;bottom:0;width:40%;"></div>
      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:6px;background:#292524;border-radius:20px;padding:5px 12px;margin-bottom:16px;">
        
          
        </div>
        <h2 style="color:#fff;font-family:'Playfair Display',serif;font-size:34px;font-weight:700;margin:0 0 10px;max-width:480px;">
          Welcome back, {{ auth.user?.name?.split(' ')[0] }} 
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const tableTypes = [
  { label: 'Small Table',  capacity: '2–4 people',   icon: 'S', desc: 'Perfect for couples or small groups' },
  { label: 'Medium Table', capacity: '5–7 people',   icon: 'M', desc: 'Great for family dinners or lunches' },
  { label: 'Large Table',  capacity: '8–10 people',  icon: 'L', desc: 'Ideal for parties and gatherings' },
]
const steps = [
  { num: 1, icon: '1', label: 'Pick a date & time' },
  { num: 2, icon: '2', label: 'Choose table size' },
  { num: 3, icon: '3', label: 'Add special notes' },
  { num: 4, icon: '4', label: 'Wait for confirmation' },
]
</script>