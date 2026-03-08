import { POSTS, CATEGORIES, formatDate } from "@/lib/blog-data";

const SITE_URL = "https://artistsmusicianshub.com";
const SITE_TITLE = "Artists Musicians HUB — Blog";
const SITE_DESC = "Artist spotlights, growth tips, industry news, and updates from San Antonio's premier music marketing platform.";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const sortedPosts = [...POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = sortedPosts.map((post) => {
    const cat = CATEGORIES.find((c) => c.id === post.category);
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const pubDate = new Date(post.date + "T12:00:00Z").toUTCString();

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(cat?.label || post.category)}</category>
      ${post.image ? `<enclosure url="${escapeXml(post.image)}" type="image/jpeg" />` : ""}
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://res.cloudinary.com/dbpremci4/image/upload/w_144,h_144,c_fit/white-hub-logo-transparent</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
