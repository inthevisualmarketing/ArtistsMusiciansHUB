import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HUB Shop — Artists Musicians HUB",
  description: "Official Artists Musicians HUB merch. Beanies, tees, hoodies, and accessories. Coming soon. Sign up to get notified when we drop.",
  keywords: ["AMH merch", "Artists Musicians HUB shop", "music merch San Antonio", "AMH beanie", "210 music merch", "independent music merch"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
