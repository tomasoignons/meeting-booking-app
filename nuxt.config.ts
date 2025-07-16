import tailwindcss from "@tailwindcss/vite";

export default {
  devtools: { enabled: true },
  build: {
    transpile: ['v-calendar'] // Transpile v-calendar for Nuxt 3 compatibility
  },
  css: ['~/assets/css/main.css'],
  vite: {
      plugins: [tailwindcss()],
  },
  modules: [
    'nuxt-toast'
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },
};
