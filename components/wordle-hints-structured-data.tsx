import Script from 'next/script'

interface WordleHintsStructuredDataProps {
  gameNumber?: number
  date?: string
  answer?: string
  status?: string
}

export default function WordleHintsStructuredData({ 
  gameNumber, 
  date, 
  answer, 
  status 
}: WordleHintsStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Wordle Daily Hints & Answers",
    "description": "Get today's Wordle hints and verified answers with our smart prediction system",
    "url": "https://puzzlerank.pro/daily-hints",
    "mainEntity": {
      "@type": "Game",
      "name": "Wordle",
      "description": "Daily word puzzle game with hints and answers",
      "gameItem": gameNumber ? {
        "@type": "Thing",
        "name": `Wordle #${gameNumber}`,
        "description": `Wordle puzzle #${gameNumber} for ${date}`,
        "datePublished": date,
        ...(answer && status === 'verified' && {
          "answer": answer
        })
      } : undefined
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://puzzlerank.pro"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Daily Hints",
          "item": "https://puzzlerank.pro/daily-hints"
        }
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "PuzzleRank.pro",
      "url": "https://puzzlerank.pro"
    }
  }

  return (
    <Script
      id="wordle-hints-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}