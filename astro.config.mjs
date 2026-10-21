import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Dominio definitivo: cambiar SITE_URL en Cloudflare Pages (o aquí) cuando se compre.
const site = process.env.SITE_URL ?? "https://ikaromensbarber.es";

export default defineConfig({
  site,
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap()],
  vite: {
    build: {
      // Sin scripts inline: permite una CSP estricta (script-src 'self').
      assetsInlineLimit: 0,
    },
  },
});
