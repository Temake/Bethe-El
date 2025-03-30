import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: true, 
      port: env.VITE_PORT || 8081, 
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
