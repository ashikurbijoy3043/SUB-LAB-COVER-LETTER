import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ─────────────────────────────────────────────────────────────
//  DEPLOYMENT BASE PATH
//
//  • Vercel  → base: '/'               (default, no change needed)
//  • GitHub Pages → base: '/SUB-LAB-COVER-LETTER/'
//
//  The GitHub Actions workflow already sets VITE_BASE_URL automatically.
//  For local dev or Vercel, it defaults to '/'.
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL ?? '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8/Rolldown expects manualChunks to be a function.
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom)[\\/]/.test(id)) {
            return 'react';
          }
        },
      },
    },
  },
});
