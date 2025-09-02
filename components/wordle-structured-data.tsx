import { WordleHints } from '@/lib/supabase/types'

interface WordleStructuredDataProps {
  gameNumber: number
  date: string
  answer: string
  hints: WordleHints
  status: 'verified' | 'candidate' | 'rejected'
  confidence: number
  url?: string
}

export default function WordleStructuredData({
  gameNumber,
  date,
  answer,
  hints,
  status,
  confidence,
  url
}: WordleStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Wordle Answer #${gameNumber} - ${answer} | Daily Solution & Hints`,
    description: `Get Wordle #${gameNumber} answer instantly! The solution is "${answer}" with hints, tips & strategies. Updated daily with verified answers.`,
    author: {
      '@type': 'Organization',
      name: 'PuzzleRank Pro',
      url: 'https://puzzlerank.pro'
    },
    publisher: {
      '@type': 'Organization',
      name: 'PuzzleRank Pro',
      url: 'https://puzzlerank.pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://puzzlerank.pro/favicon.svg'
      }
    },
    datePublished: new Date(date).toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || `https://puzzlerank.pro/wordle-${gameNumber}`
    },
    articleSection: 'Word Games',
    keywords: [
      `wordle answer ${gameNumber}`,
      `wordle solution ${answer}`,
      'wordle hints',
      'daily wordle',
      'word puzzle',
      'wordle help',
      `wordle ${date}`
    ],
    about: {
      '@type': 'Game',
      name: 'Wordle',
      description: 'A daily word puzzle game where players guess a five-letter word in six attempts',
      gameItem: {
        '@type': 'Thing',
        name: `Wordle #${gameNumber}`,
        description: `Daily Wordle puzzle #${gameNumber} with answer "${answer}"`
      }
    },
    // 游戏特定的结构化数据
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Game Number',
        value: gameNumber
      },
      {
        '@type': 'PropertyValue',
        name: 'Answer',
        value: answer
      },
      {
        '@type': 'PropertyValue',
        name: 'Word Length',
        value: hints.length
      },
      {
        '@type': 'PropertyValue',
        name: 'First Letter',
        value: hints.firstLetter
      },
      {
        '@type': 'PropertyValue',
        name: 'Difficulty',
        value: hints.difficulty
      },
      {
        '@type': 'PropertyValue',
        name: 'Word Type',
        value: hints.wordType
      },
      {
        '@type': 'PropertyValue',
        name: 'Vowels Count',
        value: hints.vowels.length
      },
      {
        '@type': 'PropertyValue',
        name: 'Consonants Count',
        value: hints.consonants.length
      },
      {
        '@type': 'PropertyValue',
        name: 'Status',
        value: status
      },
      {
        '@type': 'PropertyValue',
        name: 'Confidence',
        value: confidence
      }
    ],
    // FAQ结构化数据
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is today's Wordle answer #${gameNumber}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Today's Wordle answer #${gameNumber} is "${answer}". This ${hints.wordType} has ${hints.length} letters and starts with "${hints.firstLetter}".`
          }
        },
        {
          '@type': 'Question',
          name: `How difficult is Wordle #${gameNumber}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Wordle #${gameNumber} ("${answer}") is rated as ${hints.difficulty} difficulty. It contains ${hints.vowels.length} vowel${hints.vowels.length !== 1 ? 's' : ''} and ${hints.consonants.length} consonant${hints.consonants.length !== 1 ? 's' : ''}.`
          }
        },
        {
          '@type': 'Question',
          name: `What are some hints for Wordle #${gameNumber}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: hints.clues.join(' ')
          }
        },
        {
          '@type': 'Question',
          name: 'How do I play Wordle?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Wordle is a daily word puzzle where you have 6 attempts to guess a 5-letter word. Each guess provides feedback: green letters are correct and in the right position, yellow letters are in the word but wrong position, and gray letters are not in the word.'
          }
        }
      ]
    },
    // 面包屑导航
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://puzzlerank.pro'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Wordle',
          item: 'https://puzzlerank.pro/wordle-today'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Wordle #${gameNumber}`,
          item: url || `https://puzzlerank.pro/wordle-${gameNumber}`
        }
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}