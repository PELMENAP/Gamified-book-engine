import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '../../dist/probe',
    emptyOutDir: true,
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
})
