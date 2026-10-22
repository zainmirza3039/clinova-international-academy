import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  resolve: { alias: [
    { find: '@/auth/AuthProvider', replacement: fileURLToPath(new URL('./mockauth.ts', import.meta.url)) },
    { find: '@', replacement: fileURLToPath(new URL('../../src', import.meta.url)) },
  ] },
  define: { 'import.meta.env.VITE_LEARNER_DATA_ENABLED': JSON.stringify('true') },
  server: { host: '127.0.0.1', port: 4251, strictPort: true, fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
  build: { outDir: fileURLToPath(new URL('./dist', import.meta.url)), emptyOutDir: true, rollupOptions: { input: fileURLToPath(new URL('./index.html', import.meta.url)) } },
});
