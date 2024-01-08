import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './rx.ts',
      fileName: 'rx',
      formats: ['es'],
    }
  },
  test: {
    include: ['./*.spec.ts']
  }
})
