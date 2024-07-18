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
       
      },
    },
  },
});