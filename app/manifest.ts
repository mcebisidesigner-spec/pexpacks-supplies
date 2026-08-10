import type { MetadataRoute } from "next";
import { siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pexpacks Supplies",
    short_name: siteName,
    description:
      "School stationery packs prepared for South African parents and schools.",
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en-ZA",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#1A2A40",
    categories: ["shopping", "business", "education"],
    prefer_related_applications: false,
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
    shortcuts: [
      {
        name: "Find a School Pack",
        short_name: "Schools",
        description: "Search for a school stationery pack by school or grade.",
        url: "/schools",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Order a Pack",
        short_name: "Order",
        description: "Start a Pexpacks stationery order.",
        url: "/order",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    related_applications: [],
  };
}
