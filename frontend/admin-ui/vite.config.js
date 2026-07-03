import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('antd') || id.includes('@ant-design')) {
            return 'antd-vendor';
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts-vendor';
          }

          if (id.includes('@tiptap')) {
            return 'editor-vendor';
          }

          if (id.includes('@dnd-kit')) {
            return 'dnd-vendor';
          }
        },
      },
    },
  },
})
