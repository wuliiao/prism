import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@app': path.resolve(rootDir, './src/app'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@widgets': path.resolve(rootDir, './src/widgets'),
      '@features': path.resolve(rootDir, './src/features'),
      '@entities': path.resolve(rootDir, './src/entities'),
      '@shared': path.resolve(rootDir, './src/shared'),
    },
  },
})
