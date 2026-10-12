import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    hmr: {
      host: '148.113.174.253',
      protocol: 'ws',
      port: 3000,
    },
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      external: (id)=>{
        return id.includes('cli.tsx');
      }
    },
  },
});
