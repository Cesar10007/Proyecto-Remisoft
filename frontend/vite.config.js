import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 5173,
      // Permite la vista previa alojada en subdominios de e2b.app (solo desarrollo).
      allowedHosts: ['.e2b.app'],
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})