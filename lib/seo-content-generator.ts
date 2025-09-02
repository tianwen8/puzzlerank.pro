import { AnswerHintGenerator } from './answer-hint-generator'

export interface SEOContent {
  title: string
  description: string
  keywords: string[]
  headings: {
    h2: string[]
    h3: string[]
  }
  content: {
    introduction: string
    strategy: string
    analysis: string
    tips: string
  }
  structuredData: any
}

export interface WordlePageSEO {
  gameNumber: number
  word: string
  date: string
  isToday: boolean
}

export class SEOContentGenerator {
  private hintGenerator: AnswerHintGenerator

  constructor() {
    this.hintGenerator = new AnswerHintGenerator()
  }

  // 生成完整的SEO内容
  generateWordleSEOContent(data: WordlePageSEO): SEOContent {
    const { gameNumber, word, date, isToday } = data
    const hints = this.hintGenerator.generateHints(word)
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeContext = isToday ? 'Today' : formattedDate
    const uniqueLetters = word.split('').filter((char, index, arr) => arr.indexOf(char) === index).length
    
    return {
      title: this.generateTitle(gameNumber, word, timeContext),
      description: this.generateDescription(gameNumber, word, formattedDate, hints.difficulty),
      keywords: this.generateKeywords(gameNumber, word, formattedDate, isToday),
      headings: this.generateHeadings(gameNumber, word, formattedDate),
      content: this.generateContent(gameNumber, word, formattedDate, hints, uniqueLetters),
      structuredData: this.generateStructuredData(gameNumber, word, date)
    }
  }

  // 生成SEO优化的标题
  private generateTitle(gameNumber: number, word: string, timeContext: string): string {
    const templates = [
      `Wordle #${gameNumber} Answer ${timeContext} - ${word}`,
      `${word} - Wordle #${gameNumber} Solution ${timeContext}`,
      `Wordle #${gameNumber}: ${word} (${timeContext}) - Complete Guide`,
      `Today's Wordle #${gameNumber} Answer: ${word} - Hints & Tips`
    ]
    
    // 选择最适合的模板（今日用第4个，其他用第1个）
    return timeContext === 'Today' ? templates[3] : templates[0]
  }

  // 生成SEO描述
  private generateDescription(gameNumber: number, word: string, formattedDate: string, difficulty: string): string {
    return `Wordle #${gameNumber} answer is ${word}. Get complete solution, hints, and strategies for the ${formattedDate} puzzle. This ${difficulty.toLowerCase()}-difficulty word includes detailed analysis and tips to improve your Wordle game.`
  }

  // 生成关键词
  private generateKeywords(gameNumber: number, word: string, formattedDate: string, isToday: boolean): string[] {
    const baseKeywords = [
      `wordle ${gameNumber}`,
      `wordle ${gameNumber} answer`,
      `wordle ${word}`,
      `wordle ${gameNumber} hints`,
      `wordle solution ${gameNumber}`,
      'wordle help',
      'wordle strategy',
      'wordle tips',
      'daily wordle',
      'wordle game'
    ]

    if (isToday) {
      baseKeywords.unshift(
        'wordle answer today',
        'today wordle',
        'wordle today answer',
        'current wordle answer'
      )
    }

    // 添加日期相关关键词
    const dateKeywords = [
      `wordle ${formattedDate}`,
      `wordle answer ${formattedDate}`,
      `${formattedDate} wordle`
    ]

    // 添加字母相关关键词
    const letterKeywords = [
      `wordle ${word.charAt(0)} words`,
      `5 letter words ${word.charAt(0)}`,
      `wordle words starting with ${word.charAt(0)}`
    ]

    return [...baseKeywords, ...dateKeywords, ...letterKeywords].slice(0, 20)
  }

  // 生成标题结构
  private generateHeadings(gameNumber: number, word: string, formattedDate: string): { h2: string[], h3: string[] } {
    return {
      h2: [
        `Wordle #${gameNumber} Solution Guide`,
        `How to Solve Wordle #${gameNumber}`,
        `About the Word "${word}"`,
        `Wordle #${gameNumber} Strategy Tips`
      ],
      h3: [
        `Wordle #${gameNumber} Answer Breakdown`,
        `Letter Analysis for ${word}`,
        `Difficulty Assessment`,
        `Common Patterns in Wordle #${gameNumber}`,
        `Tips for Future Wordle Puzzles`,
        `Wordle #${gameNumber} Statistics`
      ]
    }
  }

  // 生成详细内容
  private generateContent(gameNumber: number, word: string, formattedDate: string, hints: any, uniqueLetters: number): {
    introduction: string
    strategy: string
    analysis: string
    tips: string
  } {
    return {
      introduction: `Wordle #${gameNumber} was published on ${formattedDate} and the answer is **${word}**. This ${hints.difficulty.toLowerCase()}-difficulty puzzle belongs to the ${hints.wordType} category and provides an excellent challenge for Wordle enthusiasts. Whether you're looking for the solution or want to improve your Wordle strategy, this comprehensive guide covers everything you need to know about Wordle #${gameNumber}.`,
      
      strategy: `To solve Wordle #${gameNumber} effectively, start with common vowels and consonants. The word "${word}" contains ${hints.vowels.length} unique vowel${hints.vowels.length !== 1 ? 's' : ''} (${hints.vowels.join(', ')}) and ${hints.consonants.length} consonant${hints.consonants.length !== 1 ? 's' : ''} (${hints.consonants.join(', ')}). ${hints.clues.length > 0 ? `Key hints include: ${hints.clues.join(', ')}.` : ''} Use the process of elimination and pay attention to letter positioning to narrow down your guesses efficiently.`,
      
      analysis: `The word "${word}" in Wordle #${gameNumber} contains ${uniqueLetters} unique letters out of 5 total positions. This ${hints.difficulty.toLowerCase()}-difficulty word ${uniqueLetters < 5 ? 'has repeated letters, which can make it more challenging' : 'uses all unique letters, following a standard pattern'}. The word starts with "${word.charAt(0)}" and ends with "${word.charAt(4)}", providing important positional clues for solving the puzzle.`,
      
      tips: `For future Wordle puzzles similar to #${gameNumber}, remember these key strategies: 1) Start with words containing common letters like ADIEU or AROSE, 2) Use your second guess to test different vowels and consonants, 3) Pay attention to letter frequency in English words, 4) Consider word patterns and common endings, 5) Don't forget about less common letters like ${word.split('').filter(char => 'QXZJV'.includes(char)).join(', ') || 'Q, X, Z, J, V'} when other options are exhausted. Practice with ${hints.difficulty.toLowerCase()}-difficulty words to improve your solving speed and accuracy.`
    }
  }

  // 生成结构化数据
  private generateStructuredData(gameNumber: number, word: string, date: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `Wordle #${gameNumber} Answer - ${word}`,
      description: `Complete solution and analysis for Wordle #${gameNumber}`,
      datePublished: date,
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Puzzle Rank Pro'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Puzzle Rank Pro',
        logo: {
          '@type': 'ImageObject',
          url: '/favicon.svg'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `/wordle-${gameNumber}`
      },
      about: {
        '@type': 'Game',
        name: 'Wordle',
        description: 'Daily word puzzle game',
        gameItem: {
          '@type': 'Thing',
          name: `Wordle #${gameNumber}`,
          identifier: gameNumber.toString()
        }
      },
      keywords: this.generateKeywords(gameNumber, word, date, false).join(', ')
    }
  }

  // 生成今日Wordle的特殊SEO内容
  generateTodayWordleSEO(gameNumber: number, word: string, date: string): SEOContent {
    return this.generateWordleSEOContent({
      gameNumber,
      word,
      date,
      isToday: true
    })
  }

  // 生成历史Wordle的SEO内容
  generateHistoricalWordleSEO(gameNumber: number, word: string, date: string): SEOContent {
    return this.generateWordleSEOContent({
      gameNumber,
      word,
      date,
      isToday: false
    })
  }

  // 生成批量SEO内容（用于静态生成）
  async generateBatchSEOContent(wordleData: WordlePageSEO[]): Promise<Map<number, SEOContent>> {
    const seoContentMap = new Map<number, SEOContent>()
    
    for (const data of wordleData) {
      try {
        const seoContent = this.generateWordleSEOContent(data)
        seoContentMap.set(data.gameNumber, seoContent)
      } catch (error) {
        console.error(`生成Wordle #${data.gameNumber} SEO内容失败:`, error)
      }
    }
    
    return seoContentMap
  }
}