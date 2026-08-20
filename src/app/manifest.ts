import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BrandBridge AI",
    short_name: "BrandBridge",
    description:
      "AI-powered collaboration marketplace connecting brands, product owners, and freelancers to build smarter marketing campaigns.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a12",
    theme_color: "#8b5cf6",
    categories: ["business", "marketing", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
