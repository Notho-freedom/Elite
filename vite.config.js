import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Accepte toutes les connexions
    cors: {
      origin: '*', // Permet toutes les origines
      credentials: true
    }
  }
})
