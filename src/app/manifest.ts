import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Freak",
    short_name: "Freak",
    description: "Monte suas fichas, registre cada série e acompanhe seus treinos.",
    lang: "pt-BR",
    start_url: "/treinos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C0C0E",
    theme_color: "#0C0C0E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
