import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/cctv-proxy': {
        target: 'https://192.168.1.252:443',
        changeOrigin: true,
        secure: false, // Bypass self-signed cert error
        ws: true,
        rewrite: (path) => path.replace(/^\/cctv-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove headers that prevent iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
          });
        }
      },
    },
  },
})
