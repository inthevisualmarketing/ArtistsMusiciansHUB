import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Artists Musicians HUB — Amplify Your Music",
  description:
    "San Antonio's premier music marketing platform. AMH connects independent artists with real listeners — 1M+ streams delivered since 2018. Subscribe to AMPLIFY and own your sound.",
  keywords: [
    "music marketing",
    "San Antonio music",
    "independent artists",
    "AMPLIFY",
    "music promotion",
    "The Tone Zone",
    "AMH",
    "Artists Musicians HUB",
  ],
  authors: [{ name: "Artists Musicians HUB" }],
  creator: "Artists Musicians HUB",
  publisher: "Artists Musicians HUB",
  metadataBase: new URL("https://artistsmusicianshub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://artistsmusicianshub.com",
    title: "Artists Musicians HUB — Amplify Your Music",
    description:
      "San Antonio's premier music marketing platform. 1M+ streams delivered. Join AMPLIFY and own your sound.",
    siteName: "Artists Musicians HUB",
    images: [
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_1200,h_630,c_pad,b_rgb:000a02/white-hub-logo",
        width: 1200,
        height: 630,
        alt: "Artists Musicians HUB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artists Musicians HUB — Amplify Your Music",
    description:
      "San Antonio's premier music marketing platform. 1M+ streams delivered. Join AMPLIFY and own your sound.",
    images: [
      "https://res.cloudinary.com/dbpremci4/image/upload/w_1200,h_630,c_pad,b_rgb:000a02/white-hub-logo",
    ],
  },
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_32,h_32,c_fit/white-hub-logo",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_16,h_16,c_fit/white-hub-logo",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://res.cloudinary.com/dbpremci4/image/upload/w_180,h_180,c_pad,b_rgb:000a02/white-hub-logo",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut:
      "https://res.cloudinary.com/dbpremci4/image/upload/w_32,h_32,c_fit/white-hub-logo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={mono.variable}>
      <head>
        <meta name="theme-color" content="#000a02" />
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
