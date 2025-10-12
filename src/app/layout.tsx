import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit AI Chain - AI-Powered Calorie Tracker",
  description: "Track calories with AI • Earn XP • Compete with friends • World ID verified community",
  keywords: ["calorie tracker", "AI", "health", "fitness", "world id", "nutrition", "mobile app"],
  authors: [{ name: "Fit AI Chain Team" }],
  creator: "Fit AI Chain",
  publisher: "Fit AI Chain",
  manifest: "/manifest.json",
  metadataBase: new URL('https://fit-ai-chain.vercel.app'),
  openGraph: {
    title: "Fit AI Chain - AI-Powered Calorie Tracker",
    description: "Track calories with AI • Earn XP • Compete with friends",
    type: "website",
    siteName: "Fit AI Chain",
    images: [
      {
        url: "/icon-512.svg",
        width: 512,
        height: 512,
        alt: "Fit AI Chain Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fit AI Chain - AI-Powered Calorie Tracker",
    description: "Track calories with AI • Earn XP • Compete with friends",
    images: ["/icon-512.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fit AI Chain",
    startupImage: [
      {
        url: "/icon-512.svg",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#f97316",
    "msapplication-TileColor": "#f97316",
    "msapplication-navbutton-color": "#f97316",
    "application-name": "Fit AI Chain",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@0.0.77/dist/minikit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
