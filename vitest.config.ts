import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**/*'],
  },
  resolve: {
    alias: {
      '@jmpp/config': resolve(__dirname, './packages/config/src'),
      '@jmpp/types': resolve(__dirname, './packages/types/src'),
      '@jmpp/db': resolve(__dirname, './packages/db/src'),
      '@jmpp/api': resolve(__dirname, './packages/api/src'),
    },
  },
})
