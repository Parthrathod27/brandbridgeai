import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-url";

/**
 * Only publicly reachable routes belong here. Everything under /dashboard is
 * auth-gated, so listing it would just feed crawlers a wall of redirects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl().replace(/\/$/, "");
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/forgot-password`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
