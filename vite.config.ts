import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  // Performance optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false, // Disable source maps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'chart-vendor': ['recharts', 'react-tradingview-widget'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'router-vendor': ['react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
  },
  // Dev server optimizations
  server: {
    port: 8080,
    host: true,
    fs: {
      strict: false
    }
  },
  // CSS optimizations
  css: {
    devSourcemap: false, // Disable CSS source maps in development for faster builds
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'lucide-react',
    ],
    exclude: [
      'react-tradingview-widget' // Exclude heavy widgets from pre-bundling
    ]
  },
  // ESBuild optimizations
  esbuild: {
    target: 'esnext',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  }
})
