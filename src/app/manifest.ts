import type { MetadataRoute } from "next";

/**
 * Web App Manifest (PWA) — servido em /manifest.webmanifest.
 * Ícones gerados em public/icons/ (fundo #111 + tesoura dourada #D4AF37).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BarberShop SaaS",
    short_name: "BarberShop",
    description:
      "A plataforma premium de agendamento para barbearias, salões de beleza e estúdios de tatuagem.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111111",
    theme_color: "#111111",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
