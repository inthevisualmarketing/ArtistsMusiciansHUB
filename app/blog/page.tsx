import { getAllPosts, CATEGORIES } from "@/lib/blog";
import BlogListClient from "./BlogListClient";

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogListClient posts={posts} categories={CATEGORIES} />;
}
