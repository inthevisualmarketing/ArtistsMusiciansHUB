export async function GET() {
  const robots = `# Artists Musicians HUB — robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

# Sitemap
Sitemap: https://www.artistsmusicianshub.com/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
