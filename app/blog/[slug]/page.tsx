import { getPostBySlug, getRelatedPosts, CATEGORIES } from "@/lib/blog";
import BlogPostClient from "./BlogPostClient";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const related = post ? getRelatedPosts(slug, 3) : [];
  return <BlogPostClient post={post} related={related} categories={CATEGORIES} />;
}
