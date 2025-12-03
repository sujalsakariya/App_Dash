// vite.config.js
import { fileURLToPath, URL } from "node:url";
import react from "file:///D:/Office/Website/Dashboard/CRMLeads/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///D:/Office/Website/Dashboard/CRMLeads/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///D:/Office/Website/Dashboard/CRMLeads/node_modules/tailwindcss/lib/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/Office/Website/Dashboard/CRMLeads/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    chunkSizeWarningLimit: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxPZmZpY2VcXFxcV2Vic2l0ZVxcXFxEYXNoYm9hcmRcXFxcQ1JNTGVhZHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXE9mZmljZVxcXFxXZWJzaXRlXFxcXERhc2hib2FyZFxcXFxDUk1MZWFkc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovT2ZmaWNlL1dlYnNpdGUvRGFzaGJvYXJkL0NSTUxlYWRzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV1cbiAgICB9XG4gIH0sXG4gIGJhc2U6ICcvJyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDMwMDBcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdTLFNBQVMsZUFBZSxXQUFXO0FBQzNVLE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGlCQUFpQjtBQUhpSyxJQUFNLDJDQUEyQztBQUsxTyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLFlBQVksQ0FBQztBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
