import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // This allows the server to be accessible externally
    port: 80,       // the port is set to 80 to match the Dockerfile
  },
  preview: {
    host: '0.0.0.0',  // the preview server is also accessible externally
    port: 80,       // the port is set to 80
  }
})
