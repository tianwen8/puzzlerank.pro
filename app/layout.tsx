import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import StructuredData from "@/components/structured-data"
import { WebVitals } from "@/components/web-vitals"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PuzzleRank.pro - Ultimate Puzzle Games with Global Rankings | Word Practice, 2048 & More",
  description: "Master puzzle games at PuzzleRank.pro! Play unlimited word practice games, 2048, and brain games with real-time global rankings. Compete on leaderboards, track statistics, and climb the puzzle rankings. Free online puzzle platform.",
  keywords: "puzzle ranking, word practice game, unlimited word puzzle, puzzle leaderboard, 2048 game, brain games ranking, online puzzles, puzzle competition, global rankings, puzzle statistics, word training, number puzzle",
  authors: [{ name: "PuzzleRank Team" }],
  creator: "PuzzleRank.pro",
  publisher: "PuzzleRank.pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "PuzzleRank.pro - Ultimate Puzzle Games with Global Rankings",
    description: "Master unlimited word practice, 2048, and brain games with real-time global rankings and leaderboards. Compete, track stats, and climb the puzzle rankings!",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro',
    siteName: "PuzzleRank.pro",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PuzzleRank.pro - Ultimate Puzzle Games with Global Rankings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PuzzleRank.pro - Ultimate Puzzle Games with Global Rankings",
    description: "Master word puzzles, 2048, and brain games with real-time global rankings and competitive leaderboards.",
    images: ['/twitter-image.jpg'],
    creator: '@puzzlerankpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "contact:email": "support@puzzlerank.pro",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* LCP优化 - 预加载关键资源 */}
        <link rel="preload" as="image" href="/hero-bg.webp" fetchPriority="high" />
        <link rel="preload" as="font" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" crossOrigin="anonymous" />
        
        {/* 关键CSS内联 - 首屏渲染优化 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-section{background:linear-gradient(135deg,#ff6b6b,#4ecdc4);min-height:100vh;display:flex;align-items:center;justify-content:center}
            .game-board{background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.1);padding:2rem}
            .loading-spinner{animation:spin 1s linear infinite}
            @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
          `
        }} />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L14FGHGD1B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L14FGHGD1B');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "sfr1rk4rfi");
          `}
        </Script>


        {/* SEO Structured Data */}
        <StructuredData type="website" />
      </head>
      <body className={inter.className}>
        {children}
        <WebVitals />
      </body>
    </html>
  )
}
