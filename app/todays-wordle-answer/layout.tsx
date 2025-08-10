import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Wordle Answer Today - Daily Solution & Hints Updated",
  description: "Get today's Wordle answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day with verified answers.",
  keywords: "wordle answer today, today's wordle answer, daily wordle hints, wordle solutions, wordle daily answer, wordle help today, daily wordle clues, wordle solver",
  openGraph: {
    title: "Wordle Answer Today - Daily Solution & Hints Updated",
    description: "Get today's Wordle answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day with verified answers.",
    url: '/todays-wordle-answer',
    type: 'article',
    images: [
      {
        url: '/wordle-answer-og.jpg',
        width: 1200,
        height: 630,
        alt: "Wordle Answer Today - Daily Solution & Hints Updated",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wordle Answer Today - Daily Solution & Hints",
    description: "Get today's Wordle answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day.",
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