import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      // Keep the browser's Host header so the API can match it to Origin for CSRF.
      '/api': { target: 'http://localhost:3001', changeOrigin: false },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: false },
    },
  },
})
