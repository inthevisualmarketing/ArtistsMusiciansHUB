import { POSTS } from "@/lib/blog-data";

const SITE_URL = "https://www.artistsmusicianshub.com";

const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/amplify", priority: 0.9, changefreq: "monthly" },
  { path: "/services", priority: 0.8, changefreq: "monthly" },
  { path: "/news", priority: 0.9, changefreq: "weekly" },
  { path: "/blog", priority: 0.8, changefreq: "weekly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/ambassadors", priority: 0.7, changefreq: "monthly" },
  { path: "/shop", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/refunds", priority: 0.3, changefreq: "yearly" },
];

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  const staticEntries = STATIC_ROUTES.map(
    (r) => `  <url>
    <loc>${escapeXml(SITE_URL + r.path)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join("\n");

  const blogEntries = POSTS.map(
    (post) => `  <url>
    <loc>${escapeXml(SITE_URL + "/blog/" + post.slug)}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
