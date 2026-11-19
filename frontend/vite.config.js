import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Aceptar el puerto reenviado de ESTE Codespace, no todo app.github.dev.
function hostsDeVista(port) {
  const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN = 'app.github.dev' } = process.env
  return ['.e2b.app', ...(CODESPACE_NAME ? [`${CODESPACE_NAME}-${port}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`] : [])]
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const port = Number(env.VITE_PORT) || 5173
  const previewPort = 4173

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0', port, strictPort: true,
      allowedHosts: hostsDeVista(port),
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
    // Hereda host y proxy /api. No saltar a otro puerto si hay un proceso antiguo.
    preview: { port: previewPort, strictPort: true, allowedHosts: hostsDeVista(previewPort) },
  }
})
