import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog — Artists Musicians HUB",
  description: "Artist spotlights, music industry insights, growth tips, and announcements from Artists Musicians HUB. Stay informed, stay ahead.",
  keywords: ["music blog", "artist spotlight", "music industry news", "music career tips", "independent artist blog", "music marketing tips", "San Antonio music blog", "streaming tips musicians"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
