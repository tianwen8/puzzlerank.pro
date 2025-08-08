import { getWordleCollector } from './wordle-collector'
import { WordlePredictionDB } from './database/wordle-prediction-db'

// 验证结果接口
export interface VerificationResult {
  gameNumber: number
  sources: Array<{
    name: string
    word?: string
    success: boolean
    weight: number
  }>
  consensusWord?: string
  confidence: number
  status: 'candidate' | 'verified' | 'rejected'
  timestamp: string
}

// Wordle答案验证器
export class WordleVerifier {
  private minConfidenceThreshold = 0.7
  private minSourcesRequired = 2
  
  constructor() {
    this.loadConfig()
  }
  
  // 加载配置
  private async loadConfig() {
    const config = await WordlePredictionDB.getSystemConfig('verification_config')
    if (config) {
      this.minConfidenceThreshold = config.min_confidence || 0.7
      this.minSourcesRequired = config.min_sources || 2
    }
  }
  
  // 验证今日答案
  async verifyTodayAnswer(gameNumber: number): Promise<VerificationResult> {
    console.log(`🔍 Starting verification for Wordle #${gameNumber}...`)
    
    try {
      // 采集所有源的答案
      const collectionResults = await getWordleCollector().collectTodayAnswer(gameNumber)
      
      // 获取验证源权重
      const sources = await WordlePredictionDB.getVerificationSources()
      const sourceWeights = new Map(sources.map(s => [s.name, s.weight]))
      
      // 构建验证结果
      const verificationSources = collectionResults.map(result => ({
        name: result.source,
        word: result.word,
        success: result.success,
        weight: sourceWeights.get(result.source) || 1
      }))
      
      // 计算共识答案
      const consensus = this.calculateConsensus(verificationSources)
      
      const result: VerificationResult = {
        gameNumber,
        sources: verificationSources,
        consensusWord: consensus.word,
        confidence: consensus.confidence,
        status: this.determineStatus(consensus.confidence, verificationSources.length),
        timestamp: new Date().toISOString()
      }
      
      console.log(`✅ 验证完成: ${result.consensusWord || '未找到'} (${result.status}, ${Math.round(result.confidence * 100)}%)`)
      console.log(`✅ Verification complete: ${result.consensusWord || 'Not found'} (${result.status}, ${Math.round(result.confidence * 100)}%)`)
      
      return result
      
    } catch (error) {
      console.error('Verification process error:', error)
      
      return {
        gameNumber,
        sources: [],
        confidence: 0,
        status: 'rejected',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // 计算共识答案
  private calculateConsensus(sources: Array<{name: string, word?: string, success: boolean, weight: number}>): {
    word?: string
    confidence: number
  } {
    const successfulSources = sources.filter(s => s.success && s.word)
    
    if (successfulSources.length === 0) {
      return { confidence: 0 }
    }
    
    // 统计每个答案的加权得分
    const wordScores = new Map<string, number>()
    const wordSources = new Map<string, string[]>()
    let totalWeight = 0
    
    for (const source of successfulSources) {
      const word = source.word!.toUpperCase()
      const weight = source.weight
      
      wordScores.set(word, (wordScores.get(word) || 0) + weight)
      
      if (!wordSources.has(word)) {
        wordSources.set(word, [])
      }
      wordSources.get(word)!.push(source.name)
      
      totalWeight += weight
    }
    
    // 找到得分最高的答案
    let bestWord: string | undefined
    let bestScore = 0
    
    for (const [word, score] of wordScores.entries()) {
      if (score > bestScore) {
        bestWord = word
        bestScore = score
      }
    }
    
    if (!bestWord) {
      return { confidence: 0 }
    }
    
    // 计算置信度
    const confidence = bestScore / totalWeight
    const sourceCount = wordSources.get(bestWord)!.length
    
    // 如果多个源都给出相同答案，提高置信度
    const sourceBonus = Math.min(sourceCount / successfulSources.length, 1) * 0.2
    const finalConfidence = Math.min(confidence + sourceBonus, 1)
    
      console.log(`📊 Consensus analysis: ${bestWord} (${Math.round(finalConfidence * 100)}%, ${sourceCount}/${successfulSources.length} sources)`)
    
    return {
      word: bestWord,
      confidence: finalConfidence
    }
  }
  
  // 确定验证状态 - 临时降低要求以处理源失效问题
  private determineStatus(confidence: number, sourceCount: number): 'candidate' | 'verified' | 'rejected' {
    // 临时降低验证要求：1个高权重源也可以验证
    if (confidence >= 0.8 && sourceCount >= 1) {
      return 'verified'
    } else if (confidence >= this.minConfidenceThreshold && sourceCount >= this.minSourcesRequired) {
      return 'verified'
    } else if (confidence > 0.3 && sourceCount >= 1) {
      return 'candidate'
    } else {
      return 'rejected'
    }
  }
  
  // 更新数据库中的预测
  async updatePredictionInDatabase(result: VerificationResult): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const prediction = {
        game_number: result.gameNumber,
        date: today,
        predicted_word: result.consensusWord,
        verified_word: result.status === 'verified' ? result.consensusWord : undefined,
        status: result.status,
        confidence_score: result.confidence,
        verification_sources: result.sources.filter(s => s.success).map(s => s.name),
        hints: result.consensusWord ? {
          category: 'daily',
          difficulty: result.confidence > 0.8 ? 'confirmed' : 'predicted',
          clues: [`Today's Wordle answer is ${result.consensusWord}`],
          letterHints: this.generateLetterHints(result.consensusWord)
        } : undefined,
        created_at: result.timestamp,
        updated_at: result.timestamp
      }
      
      const saved = await WordlePredictionDB.upsertPrediction(prediction)
      
      if (saved) {
        console.log(`💾 数据库更新成功: #${result.gameNumber}`)
        console.log(`💾 Database update successful: #${result.gameNumber}`)
        return true
      } else {
        console.error('💾 Database update failed')
        return false
      }
      
    } catch (error) {
      console.error('Database update error:', error)
      return false
    }
  }
  
  // 生成字母提示
  private generateLetterHints(word: string): string[] {
    if (!word || word.length !== 5) return []
    
    const hints = []
    const letters = word.split('')
    
    // 第一个字母提示
    hints.push(`Starts with "${letters[0]}"`)
    
    // 包含的字母
    const uniqueLetters = [...new Set(letters)].sort()
    if (uniqueLetters.length < 5) {
      hints.push(`Contains letters: ${uniqueLetters.join(', ')}`)
    }
    
    // 结尾字母提示
    hints.push(`Ends with "${letters[4]}"`)
    
    return hints
  }
}

// 延迟初始化的单例
let wordleVerifierInstance: WordleVerifier | null = null

export function getWordleVerifier(): WordleVerifier {
  if (!wordleVerifierInstance) {
    wordleVerifierInstance = new WordleVerifier()
  }
  return wordleVerifierInstance
}

// 为了向后兼容，也导出一个getter
export const wordleVerifier = {
  get instance() {
    return getWordleVerifier()
  }
}