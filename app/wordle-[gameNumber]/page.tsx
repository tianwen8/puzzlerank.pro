import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'
import { AnswerHintGenerator } from '@/lib/answer-hint-generator'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'
import WordleStructuredData from '@/components/wordle-structured-data'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Target, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// 启用ISR，每小时重新验证
export const revalidate = 3600

// 生成静态参数 - 预生成最近100个游戏期数的页面
export async function generateStaticParams() {
  try {
    const recentPredictions = await WordlePredictionDB.getRecentPredictions(100)
    
    return recentPredictions.map((prediction) => ({
      gameNumber: prediction.game_number.toString()
    }))
  } catch (error) {
    console.error('Failed to generate static params:', error)
    // 返回一些默认的游戏期数
    const currentGameNumber = Math.floor((Date.now() - new Date('2021-06-19').getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Array.from({ length: 50 }, (_, i) => ({
      gameNumber: (currentGameNumber - i).toString()
    }))
  }
}

interface PageProps {
  params: {
    gameNumber: string
  }
}

// 获取指定游戏期数的Wordle数据
async function getWordleData(gameNumber: number) {
  try {
    const prediction = await WordlePredictionDB.getPredictionByGameNumber(gameNumber)
    if (!prediction || !prediction.verified_word) {
      return null
    }

    // 生成提示内容
    const hintGenerator = new AnswerHintGenerator()
    const hints = hintGenerator.generateHints(prediction.verified_word)

    return {
      gameNumber: prediction.game_number,
      date: prediction.date,
      word: prediction.verified_word,
      verified: true,
      sources: ['automated-system'],
      hints,
      confidence: prediction.confidence_score || 0.95,
      status: prediction.status
    }
  } catch (error) {
    console.error(`获取Wordle #${gameNumber}数据失败:`, error)
    return null
  }
}

// 获取相邻游戏期数
async function getAdjacentGameNumbers(currentGameNumber: number) {
  try {
    const previous = await WordlePredictionDB.getPredictionByGameNumber(currentGameNumber - 1)
    const next = await WordlePredictionDB.getPredictionByGameNumber(currentGameNumber + 1)
    
    return {
      previous: previous?.verified_word ? currentGameNumber - 1 : null,
      next: next?.verified_word ? currentGameNumber + 1 : null
    }
  } catch (error) {
    return { previous: null, next: null }
  }
}

// 动态生成SEO元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const gameNumber = parseInt(params.gameNumber)
  
  if (isNaN(gameNumber) || gameNumber < 1) {
    return {
      title: 'Invalid Wordle Game Number - Puzzle Rank Pro',
      description: 'The requested Wordle game number is invalid.',
    }
  }

  const data = await getWordleData(gameNumber)
  
  if (!data) {
    return {
      title: `Wordle #${gameNumber} Answer - Puzzle Rank Pro`,
      description: `Find the answer and hints for Wordle #${gameNumber}. Complete puzzle solution with strategies and analysis.`,
    }
  }

  const { word, date } = data
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isToday = new Date(date).toDateString() === new Date().toDateString()
  const timeContext = isToday ? 'Today' : formattedDate

  return {
    title: `Wordle #${gameNumber} Answer (${timeContext}) - ${word}`,
    description: `Wordle #${gameNumber} answer is ${word}. Get hints, strategies, and detailed analysis for the ${formattedDate} puzzle. Complete solution with tips and tricks.`,
    keywords: [
      `wordle ${gameNumber}`,
      `wordle ${gameNumber} answer`,
      `wordle ${word}`,
      `wordle ${gameNumber} hints`,
      `wordle solution ${gameNumber}`,
      'wordle help',
      `wordle ${formattedDate}`
    ],
    openGraph: {
      title: `Wordle #${gameNumber} Answer: ${word}`,
      description: `Complete solution for Wordle #${gameNumber} with hints and strategies.`,
      type: 'article',
      publishedTime: date,
      tags: [`wordle-${gameNumber}`, 'wordle-answer', 'puzzle-game']
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle #${gameNumber}: ${word}`,
      description: `Answer and analysis for Wordle puzzle #${gameNumber}`
    },
    alternates: {
      canonical: `/wordle-${gameNumber}`
    }
  }
}

// 结构化数据生成
function generateStructuredData(data: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Wordle #${data.gameNumber} Answer - ${data.word}`,
    description: `Complete solution for Wordle #${data.gameNumber} with detailed analysis and hints.`,
    datePublished: data.date,
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Puzzle Rank Pro'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Puzzle Rank Pro'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/wordle-${data.gameNumber}`
    },
    about: {
      '@type': 'Game',
      name: 'Wordle',
      description: 'Daily word puzzle game',
      gameItem: {
        '@type': 'Thing',
        name: `Wordle #${data.gameNumber}`,
        identifier: data.gameNumber
      }
    }
  }
}

export default async function WordleGameNumberPage({ params }: PageProps) {
  const gameNumber = parseInt(params.gameNumber)
  
  if (isNaN(gameNumber) || gameNumber < 1) {
    notFound()
  }

  const data = await getWordleData(gameNumber)
  
  if (!data) {
    notFound()
  }

  const { word, date, hints, confidence, status } = data
  const adjacentGames = await getAdjacentGameNumbers(gameNumber)
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isToday = new Date(date).toDateString() === new Date().toDateString()
  const structuredData = generateStructuredData(data)

  return (
    <>
      {/* 结构化数据 */}
      <WordleHintsStructuredData />
      <WordleStructuredData
        gameNumber={data.gameNumber}
        date={data.date}
        answer={data.word}
        hints={data.hints}
        status={data.status}
        confidence={data.confidence}
        url={`https://puzzlerank.pro/wordle-${data.gameNumber}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 导航按钮 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {adjacentGames.previous && (
              <Button variant="outline" asChild>
                <Link href={`/wordle-${adjacentGames.previous}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Wordle #{adjacentGames.previous}
                </Link>
              </Button>
            )}
          </div>
          <div>
            {isToday && (
              <Badge variant="default" className="text-sm">
                Today's Puzzle
              </Badge>
            )}
          </div>
          <div>
            {adjacentGames.next && (
              <Button variant="outline" asChild>
                <Link href={`/wordle-${adjacentGames.next}`}>
                  Wordle #{adjacentGames.next}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 页面标题区域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              Wordle #{gameNumber} Answer
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg text-muted-foreground">{formattedDate}</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              Verified {Math.round(confidence * 100)}%
            </Badge>
            {status && (
              <Badge variant={status === 'verified' ? 'default' : 'outline'} className="text-sm">
                {status}
              </Badge>
            )}
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete solution for Wordle #{gameNumber} from {formattedDate}. 
            Get the answer, hints, and detailed analysis.
          </p>
        </div>

        {/* 答案卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Wordle #{gameNumber} Answer
            </CardTitle>
            <CardDescription>
              Solution for {formattedDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-4 tracking-wider">
                {word}
              </div>
              <p className="text-lg text-muted-foreground">
                The answer to Wordle #{gameNumber} is <strong>{word}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 提示和策略 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              Hints & Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown and strategies for Wordle #{gameNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WordleAnswerHints 
              word={word}
              gameNumber={gameNumber}
              hints={hints}
            />
          </CardContent>
        </Card>

        {/* SEO内容区域 */}
        <div className="prose prose-lg max-w-none">
          <h2>Wordle #{gameNumber} Solution Guide</h2>
          <p>
            Wordle #{gameNumber} was published on {formattedDate} and the answer is <strong>{word}</strong>. 
            This puzzle is classified as a {hints.wordType.toLowerCase()} with a {hints.difficulty.toLowerCase()} difficulty rating.
          </p>
          
          <h3>How to Solve Wordle #{gameNumber}</h3>
          <p>
            To solve Wordle #{gameNumber}, you need to guess the five-letter word "{word}" within six attempts. 
            Each guess provides color-coded feedback to help you narrow down the possibilities.
          </p>
          
          <h3>Wordle #{gameNumber} Strategy</h3>
          <ul>
            <li>Start with common vowels and consonants</li>
            <li>Use the process of elimination based on color feedback</li>
            <li>Consider letter frequency in English words</li>
            <li>Think about word patterns and common endings</li>
          </ul>

          <h3>About the Word "{word}"</h3>
          <p>
            The word "{word}" used in Wordle #{gameNumber} contains {word.split('').filter((char, index, arr) => arr.indexOf(char) === index).length} unique letters. 
            {hints.clues.length > 0 && `Key characteristics include: ${hints.clues.join(', ')}.`}
          </p>
          
          <h3>Wordle #{gameNumber} Tips</h3>
          <p>
            For future Wordle puzzles similar to #{gameNumber}, remember that {hints.difficulty.toLowerCase()}-difficulty words 
            often share certain patterns. Practice with {hints.wordType.toLowerCase()} words to improve your solving speed.
          </p>
        </div>

        {/* 相关链接 */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/wordle-today">
                Today's Wordle
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/todays-wordle-answer">
                All Answers
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/guide/how-to-play">
                How to Play
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}