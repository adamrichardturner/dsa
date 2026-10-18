import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const allowAll = { allow: "/", disallow: "/admin" };

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...allowAll },
      { userAgent: "GPTBot", ...allowAll },
      { userAgent: "ChatGPT-User", ...allowAll },
      { userAgent: "OAI-SearchBot", ...allowAll },
      { userAgent: "Google-Extended", ...allowAll },
      { userAgent: "Googlebot", ...allowAll },
      { userAgent: "Bingbot", ...allowAll },
      { userAgent: "anthropic-ai", ...allowAll },
      { userAgent: "ClaudeBot", ...allowAll },
      { userAgent: "PerplexityBot", ...allowAll },
      { userAgent: "Applebot-Extended", ...allowAll },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
