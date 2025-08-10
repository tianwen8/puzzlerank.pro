import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Wordle Hints & Today's Answer - Updated Every Day",
  description: "Get daily Wordle hints & today's answer! Smart prediction system with verified solutions, letter clues & unlimited practice. Updated every day.",
  keywords: "daily wordle hints, wordle answer today, today's wordle answer, wordle hints today, wordle daily answer, wordle help today, daily wordle clues, wordle solver",
  openGraph: {
    title: "Daily Wordle Hints & Today's Answer - Updated Every Day",
    description: "Get daily Wordle hints & today's answer! Smart prediction system with verified solutions, letter clues & unlimited practice. Updated every day.",
    url: "/daily-hints",
    type: "website",
    images: [
      {
        url: "/wordle-hints-og.jpg",
        width: 1200,
        height: 630,
        alt: "Daily Wordle Hints & Today's Answer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Wordle Hints & Today's Answer",
    description: "Get daily Wordle hints & today's answer! Smart prediction system with verified solutions & unlimited practice.",
    images: ["/wordle-hints-twitter.jpg"],
  },
  alternates: {
    canonical: "/daily-hints",
  },
}

export default function DailyHintsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}