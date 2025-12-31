import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Safely make process.env.API_KEY available in the client
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});