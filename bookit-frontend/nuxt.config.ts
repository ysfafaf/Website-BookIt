export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['./main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},  // ← changed from 'tailwindcss'
      autoprefixer: {}
    }
  },

  compatibilityDate: '2026-05-16',  // ← fix the warning too

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3010/api'
    }
  },

  routeRules: {
    '/dashboard/**': { ssr: false },
    '/admin/**':     { ssr: false },
    '/staff/**':     { ssr: false }
  },

  imports: {
    dirs: ['stores', 'composables']
  },

  app: {
    head: {
      title: 'BookIt — Restaurant Reservations',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Reserve your perfect table at BookIt.' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  devtools: { enabled: true }
})