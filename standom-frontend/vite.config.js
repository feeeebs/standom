import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(new URL('..', import.meta.url).pathname),
  resolve: {
  alias: {

  },
  extensions: ['.mjs', '.js', '.jsx', '.json', '.wasm'],
  },
})
