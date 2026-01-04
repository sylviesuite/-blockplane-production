import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: "client",
  plugins: [react()],
  base: "/", // important for Netlify so /assets/* resolve
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
