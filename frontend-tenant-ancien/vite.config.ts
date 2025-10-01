import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 9092,
    hmr: {
      port: 9093,
      host: "localhost",
      overlay: false
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  plugins: [
    react()
    // si vous aviez d’autres plugins (lovable-tagger, etc.), gardez-les ici
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));

