import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ============================================================
// AMH BLOG ENGINE — reads /content/blog/*.md files
// Server-side only (used in Server Components + Route Handlers)
// ============================================================

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export const CATEGORIES = [
  { id: "spotlight", label: "ARTIST SPOTLIGHTS", color: "#bc13fe", description: "Get to know the creative minds behind the music." },
  { id: "growth", label: "GROWTH TIPS", color: "#00f0ff", description: "Level up your music career with proven strategies." },
  { id: "industry", label: "INDUSTRY NEWS", color: "#ff2a6d", description: "What's moving the music world right now." },
  { id: "amh", label: "AMH NEWS", color: "#f5f500", description: "Updates and announcements from Artists Musicians HUB." },
];

function getMarkdownFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
}

function parsePost(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // gray-matter auto-parses YAML dates into Date objects
  let dateStr = "2024-01-01";
  if (data.date instanceof Date) {
    dateStr = data.date.toISOString().split("T")[0];
  } else if (typeof data.date === "string") {
    dateStr = data.date.split("T")[0];
  }

  return {
    slug: data.slug || filename.replace(".md", ""),
    title: data.title || "Untitled",
    category: data.category || "amh",
    date: dateStr,
    readTime: data.readTime || 5,
    excerpt: data.excerpt || "",
    image: data.image || null,
    video: data.video || null,
    download: data.download || null,
    content: content.trim(),
  };
}

export function getAllPosts() {
  const files = getMarkdownFiles();
  const posts = files.map(parsePost);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug) {
  const files = getMarkdownFiles();
  for (const file of files) {
    const post = parsePost(file);
    if (post.slug === slug) return post;
  }
  return null;
}

export function getPostsByCategory(categoryId) {
  return getAllPosts().filter((p) => p.category === categoryId);
}

export function getRelatedPosts(slug, limit = 3) {
  const post = getPostBySlug(slug);
  if (!post) return [];
  return getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== slug)
    .slice(0, limit);
}

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export function getAllSlugs() {
  return getAllPosts().map((p) => p.slug);
}

export function formatDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
