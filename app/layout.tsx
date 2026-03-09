import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import Script from "next/script";

const mono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono" });

// ── Google Analytics ID ──
const GA_ID = "G-WPWD1K1CH7";

export const metadata: Metadata = {
  title: {
    template: "%s | Artists Musicians HUB",
    default: "Artists Musicians HUB — Amplify Your Music. Own Your Sound.",
  },
  description:
    "San Antonio's premier music marketing platform. Professional promotion, playlist pitching, social media management, sync licensing, and artist development for independent artists. Over 1M+ streams generated since 2018.",
  keywords: [
    "music marketing",
    "music marketing agency",
    "music marketing San Antonio",
    "artist promotion",
    "artist development",
    "independent artist marketing",
    "San Antonio music",
    "San Antonio hip hop",
    "San Antonio rap",
    "San Antonio R&B",
    "San Antonio artists",
    "210 music",
    "210 rap",
    "Texas music marketing",
    "Texas hip hop",
    "sync licensing",
    "sync licensing for independent artists",
    "music distribution",
    "playlist pitching",
    "playlist promotion",
    "social media management for musicians",
    "music promotion services",
    "music video promotion",
    "Spotify promotion",
    "AMPLIFY",
    "AMPLIFY music marketing",
    "Artists Musicians HUB",
    "Artists Musicians Hub",
    "AMH",
    "AMH San Antonio",
    "Tone Zone",
    "Tone Zone San Antonio",
    "independent artists",
    "indie music promotion",
    "music production",
    "music branding",
    "artist branding",
    "music campaign management",
    "ads for musicians",
    "graphic design for musicians",
    "website development for artists",
    "app development for musicians",
    "brand ambassador music",
    "music merch",
  ],
  openGraph: {
    title: "Artists Musicians HUB — Amplify Your Music. Own Your Sound.",
    description: "San Antonio's premier music marketing platform. Professional promotion, distribution, and sync licensing for independent artists. Over 1M+ streams generated since 2018.",
    url: "https://artistsmusicianshub.com",
    siteName: "Artists Musicians HUB",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_1200,h_630,c_fill/white-hub-logo-transparent",
        width: 1200,
        height: 630,
        alt: "Artists Musicians HUB — San Antonio Music Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artists Musicians HUB",
    description: "Amplify Your Music. Own Your Sound. San Antonio's premier music marketing platform.",
  },
  icons: {
    icon: "https://res.cloudinary.com/dbpremci4/image/upload/w_32,h_32,c_fit/white-hub-logo-transparent",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://artistsmusicianshub.com",
  },
};

import SiteNav from "@/components/SiteNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a0f",
          fontFamily: "var(--font-mono), 'Courier New', monospace",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
