
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/users': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/api/products': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      '/api/orders': {
        target: 'http://localhost:8083',
        changeOrigin: true
      },
      '/api/payments': {
        target: 'http://localhost:8084',
        changeOrigin: true
      }
    }
  }
})
