import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "The Tone Zone — San Antonio Artist Directory | Artists Musicians HUB",
  description: "Discover 50+ independent artists from San Antonio. The Tone Zone is a free showcase of the 210's best hip-hop, R&B, producers, and performers. Always free, always open.",
  keywords: ["Tone Zone", "San Antonio artists", "210 hip hop", "San Antonio rappers", "independent artists San Antonio", "Texas musicians", "free artist directory", "San Antonio music scene"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
