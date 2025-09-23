import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      // Satellite API on HTTP:
      '/sat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/sat/, '')
      },
      // ServiceBroker API on HTTP:
      '/broker': {
        target: 'http://localhost:8099',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/broker/, '')
      }
    }
  }
})
