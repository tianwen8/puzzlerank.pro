import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wordle Daily Hints & Answers Today | PuzzleRank.pro",
  description: "Get today's Wordle hints and verified answers! Our smart prediction system provides daily Wordle clues, letter hints, and verified solutions from multiple sources. Never miss a Wordle puzzle again!",
  keywords: "wordle hints today, wordle answer today, daily wordle clues, wordle help, wordle solver, wordle prediction, today's wordle, wordle daily hints, wordle letter hints, wordle verification",
  openGraph: {
    title: "Wordle Daily Hints & Answers Today | PuzzleRank.pro",
    description: "Get today's Wordle hints and verified answers! Smart prediction system with daily clues and verified solutions.",
    url: "/daily-hints",
    type: "website",
    images: [
      {
        url: "/wordle-hints-og.jpg",
        width: 1200,
        height: 630,
        alt: "Wordle Daily Hints System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wordle Daily Hints & Answers Today",
    description: "Get today's Wordle hints and verified answers with our smart prediction system!",
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