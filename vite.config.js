import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Increase the file size limit — our bundle includes Agora + Firebase + Leaflet
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'MedConnect',
        short_name: 'MedConnect',
        description: 'Healthcare assistance, whenever you need it.',
        theme_color: '#0878d1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) needs manualChunks as a FUNCTION, not an object
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-vendor'
            if (id.includes('react-dom')) return 'react-vendor'
            if (id.includes('/react/')) return 'react-vendor'
            if (id.includes('firebase')) return 'firebase-vendor'
            if (id.includes('agora')) return 'agora-vendor'
            if (id.includes('leaflet')) return 'map-vendor'
            if (id.includes('groq-sdk')) return 'ai-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
})