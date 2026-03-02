import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('@supabase/supabase-js')) return 'supabase'
          if (id.includes('leaflet')) return 'leaflet'
          if (id.includes('recharts')) return 'recharts'
          if (id.includes('@tanstack/react-query')) return 'tanstack-query'
          if (id.includes('@tanstack/react-router')) return 'tanstack-router'
          if (id.includes('react')) return 'react-vendor'

          return 'vendor'
        },
      },
    },
  },
})
