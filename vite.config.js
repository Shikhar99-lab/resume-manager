import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/* gets forwarded to the Express backend.
      // The browser only ever sees localhost:5173 — the Groq API key
      // never leaves the server process.
      '/api': 'http://localhost:3001',
    },
  },
})
