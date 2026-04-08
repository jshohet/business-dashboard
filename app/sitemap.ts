import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const publicRoutes = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
    {
      path: "/privacy-notice",
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      path: "/terms-of-use",
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      path: "/cookie-notice",
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      path: "/contact-data-requests",
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ];

  return publicRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
