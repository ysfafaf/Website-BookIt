<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'default' })

const auth = useAuthStore()

const tableTypes = [
  { label: 'Small Table',  capacity: '2–4 people',  icon: 'S', desc: 'Perfect for couples or small groups' },
  { label: 'Medium Table', capacity: '5–7 people',  icon: 'M', desc: 'Great for family dinners or lunches' },
  { label: 'Large Table',  capacity: '8–10 people', icon: 'L', desc: 'Ideal for parties and gatherings' },
]

const steps = [
  { num: 1, icon: '1', label: 'Pick a date & time' },
  { num: 2, icon: '2', label: 'Choose table size'  },
  { num: 3, icon: '3', label: 'Add special notes'  },
  { num: 4, icon: '4', label: 'Wait for confirmation' },
]
</script>

<template>
  <div>

    <!-- Hero banner -->
    <div style="background:#1C1917;border-radius:18px;padding:36px 32px;margin-bottom:24px;position:relative;overflow:hidden;">
      <div style="position:absolute;right:0;top:0;bottom:0;width:35%;background-image: url(/Background2.jpg);border-left:1px solid #292524; background-position: center; background-size: cover;"></div>
      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:6px;background:transparent;border-radius:20px;padding:5px 12px;margin-bottom:14px;">
        </div>
        <h2 style="color:#fff;font-family:'Playfair Display',serif;font-size:28px;font-weight:700;margin:0 0 10px;max-width:480px;line-height:1.3;">
          Welcome back, {{ auth.user?.name?.split(' ')[0] }} 
        </h2>
        <p style="color:#A8A29E;font-size:14px;margin:0 0 24px;max-width:380px;line-height:1.6;">
          Reserve your ideal table and enjoy a perfectly curated dining experience.
        </p>
        <NuxtLink to="/dashboard/reserve"
          style="display:inline-flex;align-items:center;gap:6px;background:#D97706;color:#fff;padding:11px 24px;border-radius:9px;font-weight:600;font-size:14px;text-decoration:none;">
          Make a Reservation →
        </NuxtLink>
      </div>
    </div>

    <!-- Table type cards -->
    <div class="grid-3" style="margin-bottom:24px;">
      <div
        v-for="t in tableTypes"
        :key="t.label"
        style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:20px;"
      >
        <div style="width:44px;height:44px;background:#FEF3C7;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:20px;">
          {{ t.icon }}
        </div>
        <div style="font-weight:700;font-size:15px;color:#1C1917;margin-bottom:4px;">{{ t.label }}</div>
        <div style="font-size:13px;color:#92400E;font-weight:600;margin-bottom:6px;">{{ t.capacity }}</div>
        <div style="font-size:13px;color:#78716C;line-height:1.5;">{{ t.desc }}</div>
      </div>
    </div>

    <!-- How it works -->
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:24px;">
      <h3 style="margin:0 0 20px;font-family:'Playfair Display',serif;font-size:18px;color:#1C1917;">
        How it works
      </h3>
      <div class="grid-4">
        <div
          v-for="step in steps"
          :key="step.num"
          style="text-align:center;"
        >
          <div style="width:48px;height:48px;background:#F5F5F4;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:20px;">
            {{ step.icon }}
          </div>
          <div style="font-size:11px;font-weight:700;color:#D97706;margin-bottom:4px;letter-spacing:0.05em;">
            STEP 0{{ step.num }}
          </div>
          <div style="font-size:13px;font-weight:600;color:#1C1917;line-height:1.4;">
            {{ step.label }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>