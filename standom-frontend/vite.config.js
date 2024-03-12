import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
  alias: {

  },
  extensions: ['.mjs', '.js', '.jsx', '.json', '.wasm'],
  },
})
