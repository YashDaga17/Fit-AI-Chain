import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#ea580c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* PWA and Mobile optimizations */}
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        <link rel="shortcut icon" href="/icon-192.svg" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-rendering`}
        suppressHydrationWarning
      >
        <div className="min-h-screen safe-top safe-bottom">
          {children}
        </div>
      </body>
    </html>
  );
}
