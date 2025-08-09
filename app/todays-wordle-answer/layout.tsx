import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Today's Wordle Answer - Daily Hints & Solutions | PuzzleRank.pro",
  description: "Get today's Wordle answer instantly! Daily verified solutions, hints, and strategies for Wordle puzzle game. Updated every day with accurate answers and helpful tips.",
  keywords: "today's wordle answer, wordle today, daily wordle solution, wordle hints today, wordle answer today, wordle help, daily puzzle answer",
  openGraph: {
    title: "Today's Wordle Answer - Daily Hints & Solutions",
    description: "Get today's Wordle answer instantly! Daily verified solutions, hints, and strategies for Wordle puzzle game.",
    url: '/todays-wordle-answer',
    type: 'article',
    images: [
      {
        url: '/wordle-answer-og.jpg',
        width: 1200,
        height: 630,
        alt: "Today's Wordle Answer - Daily Solutions",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Today's Wordle Answer - Daily Hints & Solutions",
    description: "Get today's Wordle answer instantly! Daily verified solutions and helpful tips.",
  },
  alternates: {
    canonical: '/todays-wordle-answer',
  },
}

export default function TodaysWordleAnswerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}