import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@erp/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@erp/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@erp/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/crm': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'table': ['@tanstack/react-table'],
          'charts': ['recharts'],
          'keycloak': ['keycloak-js'],
        },
      },
    },
  },
  define: {
    'process.env': process.env,
  },
});
