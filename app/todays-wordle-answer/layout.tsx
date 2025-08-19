import type { Metadata } from 'next'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

async function getTodayGameNumber(): Promise<number | null> {
  try {
    const todayData = await WordlePredictionDB.getTodayPrediction()
    return todayData?.game_number || null
  } catch (error) {
    console.error('Failed to get today game number:', error)
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const todayGameNumber = await getTodayGameNumber()
  
  if (todayGameNumber) {
    return {
      title: `Wordle #${todayGameNumber} Answer Today - Daily Solution & Hints Updated`,
      description: `Get today's Wordle #${todayGameNumber} answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day with verified answers.`,
      keywords: `wordle answer today, today's wordle answer, wordle ${todayGameNumber}, wordle #${todayGameNumber}, daily wordle hints, wordle solutions, wordle daily answer, wordle help today, daily wordle clues, wordle solver`,
      openGraph: {
        title: `Wordle #${todayGameNumber} Answer Today - Daily Solution & Hints Updated`,
        description: `Get today's Wordle #${todayGameNumber} answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day with verified answers.`,
        url: '/todays-wordle-answer',
        type: 'article',
        images: [
          {
            url: '/wordle-answer-og.jpg',
            width: 1200,
            height: 630,
            alt: `Wordle #${todayGameNumber} Answer Today - Daily Solution & Hints Updated`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Wordle #${todayGameNumber} Answer Today - Daily Solution & Hints`,
        description: `Get today's Wordle #${todayGameNumber} answer instantly! Daily solutions with hints, tips & unlimited practice. Updated every day.`,
      },
      alternates: {
        canonical: `/wordle/${todayGameNumber}`,
      },
    }
  }

  // Fallback metadata if no game number available
  return {
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
}

export default function TodaysWordleAnswerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
