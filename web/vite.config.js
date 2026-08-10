import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub Pages sub-path (https://<user>.github.io/<repo>/).
// Set BASE_PATH=/ for Vercel, Netlify, or a custom domain.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/bpi-indicator/',
  plugins: [react()],
})
