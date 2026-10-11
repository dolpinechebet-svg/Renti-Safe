import type { MetadataRoute } from "next";
import { campuses, posts, towns } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rentisafe.co.ke";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/rentals", "/terms", "/privacy", "/refund-policy", "/scam-database-policy", "/scam-database", "/blog"];
  return [
    ...staticPaths.map((route) => ({ url: `${siteUrl}${route}`, changeFrequency: "weekly" as const, priority: route === "/" ? 1 : 0.6 })),
    ...towns.map((town) => ({ url: `${siteUrl}/verify/${town.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...campuses.map((campus) => ({ url: `${siteUrl}/students/${campus.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((post) => ({ url: `${siteUrl}/blog/${post.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
