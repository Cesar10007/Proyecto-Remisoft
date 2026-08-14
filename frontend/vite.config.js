import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Durante la migración conviven dos backends:
// - Express puerto 3000: módulos ya migrados a Prisma.
// - Laravel puerto 8000: módulos pendientes de migrar.
//
// IMPORTANTE:
// Las rutas específicas deben ir antes de '/api',
// porque '/api' funciona como fallback hacia Laravel.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/cajas': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/clientes': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/ingredientes': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/domicilios': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/proveedores': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/productos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/usuarios': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },

      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  },
})