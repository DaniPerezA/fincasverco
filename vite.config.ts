import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const pages = process.env["GITHUB_PAGES"] === "1";

function publishable(path: string): boolean {
  const normalized = path.replace(/\/$/, "") || "/";
  if (normalized === "/admin" || normalized.startsWith("/admin/")) return false;
  if (normalized.startsWith("/portal/") && normalized !== "/portal") return false;
  return true;
}

export default defineConfig({
  base: pages ? "/fincasverco/" : "/",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      server: { entry: "server" },
      ...(pages
        ? {
            prerender: {
              enabled: true,
              crawlLinks: true,
              autoSubfolderIndex: true,
              filter: (page: { path: string }) => publishable(page.path),
            },
          }
        : {}),
    }),
    viteReact(),
    tailwindcss(),
  ],
});
