interface CollectionResult {
  success: boolean
  data?: {
    gameNumber: number
    answer: string
    date: string
  }
  error?: string
}

// 手动维护的最新答案数据
const KNOWN_ANSWERS: { [key: string]: { gameNumber: number, answer: string } } = {
  '2025-08-12': { gameNumber: 1516, answer: 'NOMAD' }, // 根据你提到的官方数据
  '2025-08-11': { gameNumber: 1515, answer: 'PLUMB' }, // 示例数据
  '2025-08-10': { gameNumber: 1514, answer: 'MOUND' }, // 示例数据
  // 可以继续添加更多已知答案
}

export class NYTManualCollector {
  private readonly baseDate = new Date('2021-06-19') // Wordle #1 的基准日期
  
  private calculateGameNumber(dateStr: string): number {
    const targetDate = new Date(dateStr)
    const diffTime = targetDate.getTime() - this.baseDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }
  
  async collectTodayAnswer(dateStr: string): Promise<CollectionResult> {
    try {
      console.log(`Attempting to collect answer for date: ${dateStr}`)
      
      // 首先检查是否有手动维护的答案
      if (KNOWN_ANSWERS[dateStr]) {
        const knownData = KNOWN_ANSWERS[dateStr]
        console.log(`Found known answer for ${dateStr}: Game #${knownData.gameNumber}, Answer: ${knownData.answer}`)
        
        return {
          success: true,
          data: {
            gameNumber: knownData.gameNumber,
            answer: knownData.answer.toUpperCase(),
            date: dateStr
          }
        }
      }
      
      // 如果没有已知答案，计算游戏编号并提示需要手动更新
      const calculatedGameNumber = this.calculateGameNumber(dateStr)
      
      console.log(`No known answer for ${dateStr}. Calculated game number: ${calculatedGameNumber}`)
      console.log(`Please manually add the answer to KNOWN_ANSWERS in lib/nyt-manual-collector.ts`)
      
      return {
        success: false,
        error: `No known answer for date ${dateStr}. Game number would be #${calculatedGameNumber}. Please update manually.`
      }
      
    } catch (error) {
      console.error('Manual collection failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  async collectHistoricalAnswer(dateStr: string): Promise<CollectionResult> {
    return this.collectTodayAnswer(dateStr)
  }
  
  // 辅助方法：添加新的已知答案
  static addKnownAnswer(dateStr: string, gameNumber: number, answer: string) {
    KNOWN_ANSWERS[dateStr] = { gameNumber, answer: answer.toUpperCase() }
    console.log(`Added known answer: ${dateStr} -> Game #${gameNumber}: ${answer}`)
  }
  
  // 辅助方法：获取所有已知答案
  static getKnownAnswers() {
    return { ...KNOWN_ANSWERS }
  }
  
  // 辅助方法：检查是否有某日期的答案
  static hasAnswerForDate(dateStr: string): boolean {
    return dateStr in KNOWN_ANSWERS
  }
}