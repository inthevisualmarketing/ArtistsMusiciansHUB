import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AMPLIFY — Music Marketing Subscriptions | Artists Musicians HUB",
  description: "AMPLIFY your music career with professional marketing. Three tiers: Basic ($100/mo), Pro ($250/mo), Elite ($500/mo). Playlist pitching, social media promotion, sync licensing, and more.",
  keywords: ["AMPLIFY music marketing", "music marketing subscription", "playlist pitching service", "music promotion packages", "artist marketing plans", "San Antonio music promotion", "sync licensing service"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
