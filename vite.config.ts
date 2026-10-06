import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

  return {
    define: {
      // Expose the key to client code via import.meta.env.VITE_GEMINI_API_KEY.
      // Vercel injects VITE_* variables automatically at build time; this also
      // keeps local `.env.local` (GEMINI_API_KEY) working as before.
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      // Backwards compatibility for anything still reading process.env —
      // stub the whole object so no browser ever throws
      // "ReferenceError: process is not defined".
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env': {},
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      port: 3000,
    },
    preview: {
      host: true,
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
