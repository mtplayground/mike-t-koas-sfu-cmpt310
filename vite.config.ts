import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export function normalizeBasePath(rawBasePath: string | undefined) {
  const basePath = rawBasePath?.trim();

  if (!basePath || basePath === "/") {
    return "/";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 8080,
    },
  };
});
