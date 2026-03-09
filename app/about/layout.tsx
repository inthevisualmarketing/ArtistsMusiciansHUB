import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About Us — Artists Musicians HUB",
  description: "Learn about Artists Musicians HUB — San Antonio's premier music marketing agency. Est. 2018, 1M+ streams, 50+ artists. Meet the team behind the movement.",
  keywords: ["about Artists Musicians HUB", "AMH team", "San Antonio music agency", "music marketing team", "210 music community", "independent artist support"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
