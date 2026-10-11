import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KyoHub",
    short_name: "KyoHub",
    description: "Keep passwords, grocery lists, and family appointments organized in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icons/icon-192-v2.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512x512-v2.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512x512-v2.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
