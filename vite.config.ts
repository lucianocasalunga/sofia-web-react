import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false
      },
      '/login': {
        target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false
      },
      '/logout': {
        target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
