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
      '@pascal-app/core': path.resolve(__dirname, './pascal-fork/packages/core/src/index.ts'),
      '@pascal-app/viewer': path.resolve(__dirname, './pascal-fork/packages/viewer/src/index.ts'),
      '@pascal-app/editor': path.resolve(__dirname, './pascal-fork/packages/editor/src/index.tsx'),
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
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
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
