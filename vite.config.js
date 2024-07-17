import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      '/api': {
        target: 'http://203.170.129.88:9078',
        changeOrigin: true,
        rewrite: (path) => {
          console.log(`Rewriting path: ${path}`);
          return path.replace(/^\/api/, '');
        },
        // configure: (proxy, options) => {
        //   proxy.on('proxyReq', (proxyReq, req, res) => {
        //     console.log(`Proxying request to: ${req.url}`);
        //   });
        //   proxy.on('proxyRes', (proxyRes, req, res) => {
        //     console.log(`Received response for: ${req.url}`);
        //   });
        // },
      },
    },
  },
});