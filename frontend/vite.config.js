import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      '/api/categorias': {
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
      '/api/pedidos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },

    }
  },
})