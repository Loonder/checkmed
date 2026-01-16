import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        exclude: ['**/node_modules/**', '**/tests/**'], // Exclude Playwright E2E tests
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
