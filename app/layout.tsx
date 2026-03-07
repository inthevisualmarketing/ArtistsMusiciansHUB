import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import Script from "next/script";

const mono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono" });

// ── Google Analytics ID ──
const GA_ID = "G-WPWD1K1CH7";

export const metadata: Metadata = {
  title: "Artists Musicians HUB — Amplify Your Music. Own Your Sound.",
  description:
    "San Antonio's premier music marketing platform. Professional promotion, distribution, and sync licensing for independent artists. 1M+ streams generated.",
  keywords: [
    "music marketing",
    "artist promotion",
    "San Antonio music",
    "sync licensing",
    "music distribution",
    "AMPLIFY",
    "Artists Musicians HUB",
    "AMH",
    "Tone Zone",
    "independent artists",
  ],
  openGraph: {
    title: "Artists Musicians HUB",
    description: "Amplify Your Music. Own Your Sound. San Antonio's premier music marketing platform.",
    url: "https://artistsmusicianshub.com",
    siteName: "Artists Musicians HUB",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_1200,h_630,c_fill/white-hub-logo-transparent",
        width: 1200,
        height: 630,
        alt: "Artists Musicians HUB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artists Musicians HUB",
    description: "Amplify Your Music. Own Your Sound.",
  },
  icons: {
    icon: "https://res.cloudinary.com/dbpremci4/image/upload/w_32,h_32,c_fit/white-hub-logo-transparent",
  },
};

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
        {children}
      </body>
    </html>
  );
}
