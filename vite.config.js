import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Позволяет доступ извне
    allowedHosts: ["8862-83-24-216-248.ngrok-free.app"], // Укажи свой ngrok-домен
  },
})
