import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        buffer: 'buffer/',
      },
    },
    define: {
      'process.env': env,
      global: {},
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    base: './',
    build: {
      minify: 'terser',
      cssCodeSplit: true,

      sourcemap: false,
      target: 'modules',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          }
        }
      }
    },

  }
})
