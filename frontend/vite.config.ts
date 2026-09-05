import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The production build is written straight onto the Spring Boot classpath, so
// `./mvnw package` yields one jar that serves both the API and the UI.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../target/classes/static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
