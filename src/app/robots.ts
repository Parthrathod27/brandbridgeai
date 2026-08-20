import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl().replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth-gated and machine-only surfaces — nothing here is useful to a
        // crawler, and /reset-password carries single-use tokens.
        disallow: [
          "/api/",
          "/dashboard/",
          "/onboarding/",
          "/verify-otp",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
