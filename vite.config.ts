import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/colorblind-sim/', // ← Add this for GitHub Pages project site
  server: {
    port: 3000,
    open: true
  }
})