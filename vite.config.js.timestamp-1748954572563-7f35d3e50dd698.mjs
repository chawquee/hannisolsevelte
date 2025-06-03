// vite.config.js
import { sveltekit } from "file:///home/project/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  // Server configuration
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [".."]
    }
  },
  // Build configuration
  build: {
    target: "es2020",
    sourcemap: true
  },
  // Optimizations
  optimizeDeps: {
    include: ["@solana/web3.js", "@solana/spl-token", "better-sqlite3"]
  },
  // Define global constants
  define: {
    global: "globalThis"
  },
  // CSS configuration
  css: {
    postcss: "./postcss.config.js"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdFxuXHQvLyBTZXJ2ZXIgY29uZmlndXJhdGlvblxuXHRzZXJ2ZXI6IHtcblx0XHRwb3J0OiA1MTczLFxuXHRcdGhvc3Q6IHRydWUsXG5cdFx0ZnM6IHtcblx0XHRcdGFsbG93OiBbJy4uJ11cblx0XHR9XG5cdH0sXG5cblx0Ly8gQnVpbGQgY29uZmlndXJhdGlvblxuXHRidWlsZDoge1xuXHRcdHRhcmdldDogJ2VzMjAyMCcsXG5cdFx0c291cmNlbWFwOiB0cnVlXG5cdH0sXG5cblx0Ly8gT3B0aW1pemF0aW9uc1xuXHRvcHRpbWl6ZURlcHM6IHtcblx0XHRpbmNsdWRlOiBbJ0Bzb2xhbmEvd2ViMy5qcycsICdAc29sYW5hL3NwbC10b2tlbicsICdiZXR0ZXItc3FsaXRlMyddXG5cdH0sXG5cblx0Ly8gRGVmaW5lIGdsb2JhbCBjb25zdGFudHNcblx0ZGVmaW5lOiB7XG5cdFx0Z2xvYmFsOiAnZ2xvYmFsVGhpcydcblx0fSxcblxuXHQvLyBDU1MgY29uZmlndXJhdGlvblxuXHRjc3M6IHtcblx0XHRwb3N0Y3NzOiAnLi9wb3N0Y3NzLmNvbmZpZy5qcydcblx0fVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGlCQUFpQjtBQUNuUCxTQUFTLG9CQUFvQjtBQUU3QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUE7QUFBQSxFQUdyQixRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDSCxPQUFPLENBQUMsSUFBSTtBQUFBLElBQ2I7QUFBQSxFQUNEO0FBQUE7QUFBQSxFQUdBLE9BQU87QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNaO0FBQUE7QUFBQSxFQUdBLGNBQWM7QUFBQSxJQUNiLFNBQVMsQ0FBQyxtQkFBbUIscUJBQXFCLGdCQUFnQjtBQUFBLEVBQ25FO0FBQUE7QUFBQSxFQUdBLFFBQVE7QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdBLEtBQUs7QUFBQSxJQUNKLFNBQVM7QUFBQSxFQUNWO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
