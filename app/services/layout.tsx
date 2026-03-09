import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Services — Artists Musicians HUB",
  description: "Full-service music marketing: social media management, ad campaigns, artist development, app development, website design, and graphic design/VFX for independent artists.",
  keywords: ["music marketing services", "social media management musicians", "music ad campaigns", "artist development program", "music website design", "graphic design musicians", "VFX music videos", "San Antonio music services"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
