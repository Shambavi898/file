import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// Resolve root and asset paths correctly across platforms
const publicRoot = normalizePath(path.resolve(__dirname, 'public'))
const outDir = normalizePath(path.resolve(__dirname, 'dist'))

export default defineConfig({
  root: publicRoot,
  base: './',
  publicDir: normalizePath(path.resolve(__dirname, 'assets')),
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(publicRoot, 'index.html'),
        intro: path.resolve(publicRoot, 'intro.html'),
        savingsChallenge: path.resolve(publicRoot, '30-day-savings-challenge.html'),
        budgetPlanner: path.resolve(publicRoot, 'digital-budget-planner.html'),
        notebook: path.resolve(publicRoot, 'digital-notebook.html'),
        savingsTracker: path.resolve(publicRoot, 'savings-tracker.html'),
        todo: path.resolve(publicRoot, 'todo-list.html'),
        weeklyPlanner: path.resolve(publicRoot, 'weekly-planner.html'),
        weekly: path.resolve(publicRoot, 'weekly.html'),
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'ProductivitySuite',
        short_name: 'ProdSuite',
        description: 'Your productivity toolkit',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, 'capacitor.config.json')),
          dest: 'config'
        },
        {
          src: normalizePath(path.resolve(__dirname, 'assets/**/*')),
          dest: 'assets'
        }
      ]
    }),
    process.env.NODE_ENV === 'production' &&
      visualizer({
        filename: path.resolve(outDir, 'bundle-stats.html'),
        open: true,
        gzipSize: true,
        brotliSize: true
      })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'assets'),
      '@styles': path.resolve(__dirname, 'styles'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: {
      host: 'localhost',
    }
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    },
    include: ['tests/**/*.test.{ts,tsx}'],
    threads: true
  },
  optimizeDeps: {
    include: [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/status-bar'
    ]
  }
})