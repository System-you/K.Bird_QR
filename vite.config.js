import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://203.170.129.88:9078',
        changeOrigin: true,
        rewrite: (path) => {
          console.log(`Rewriting path from ${path} to ${path.replace(/^\/api/, '')}`);
          return path.replace(/^\/api/, '');
        },
        configure: (proxy, options) => {
          console.log('Proxy configured with options:', options);
        },
      },
    },
  },
});