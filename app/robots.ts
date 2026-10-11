import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rentisafe.co.ke";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/agent", "/status/", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
