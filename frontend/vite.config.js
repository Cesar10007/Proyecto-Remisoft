import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 5173,
    },
  }
})