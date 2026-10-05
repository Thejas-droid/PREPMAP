import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png','icon-512.png'],
      manifest: {
        name: 'Quant Path — Optiver Preparation',
        short_name: 'Quant Path',
        description: 'A calm daily study planner for a quantitative developer transition.',
        theme_color: '#f5f3ee',
        background_color: '#f5f3ee',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,json,png,svg}'] }
    })
  ]
})
