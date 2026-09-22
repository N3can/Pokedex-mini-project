import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Pokedex-mini-project/', // matches your actual GitHub repo name exactly, case-sensitive
  plugins: [react()],
})
