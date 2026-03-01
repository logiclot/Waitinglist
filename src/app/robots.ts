import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/business/",
          "/admin/",
          "/expert/",
          "/onboarding/",
          "/api/",
          "/messages/",
          "/inbox/",
          "/orders/",
          "/invoice/",
          "/nda/",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://logiclot.com/sitemap.xml",
  };
}
