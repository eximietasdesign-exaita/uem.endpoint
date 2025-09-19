import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // If Satellite runs on HTTPS:
      '/sat': {
        target: 'https://localhost:7200',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/sat/, '')
      },
      // If ServiceBroker runs on HTTPS:
      '/broker': {
        target: 'https://localhost:7201',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/broker/, '')
      }
    }
  }
})
