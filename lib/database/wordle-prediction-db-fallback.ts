import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'lib/database/wordle-data.json')

interface WordlePrediction {
  id: number
  game_number: number
  date: string
  predicted_word: string
  verified_word?: string
  status: 'candidate' | 'verified' | 'rejected'
  confidence_score: number
  verification_sources: string[]
  hints?: any
  created_at: string
  updated_at: string
}

class WordlePredictionDBFallback {
  private readData(): { predictions: WordlePrediction[] } {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return { predictions: [] }
      }
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取数据文件失败:', error)
      return { predictions: [] }
    }
  }

  private writeData(data: { predictions: WordlePrediction[] }): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('写入数据文件失败:', error)
    }
  }

  async getTodayPrediction(): Promise<WordlePrediction | null> {
    const data = this.readData()
    const today = new Date().toISOString().split('T')[0]
    return data.predictions.find(p => p.date === today) || null
  }

  async getHistoryPredictions(limit: number = 20): Promise<WordlePrediction[]> {
    const data = this.readData()
    return data.predictions
      .filter(p => p.status === 'verified')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  async getCandidatePredictions(limit: number = 10): Promise<WordlePrediction[]> {
    const data = this.readData()
    return data.predictions
      .filter(p => p.status === 'candidate')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  async getStats(): Promise<any> {
    const data = this.readData()
    const total = data.predictions.length
    const verified = data.predictions.filter(p => p.status === 'verified').length
    const candidates = data.predictions.filter(p => p.status === 'candidate').length
    
    return {
      total,
      verified,
      candidates,
      verificationRate: total > 0 ? verified / total : 0
    }
  }

  async getAllPredictions(): Promise<WordlePrediction[]> {
    const data = this.readData()
    return data.predictions
  }

  async updatePredictionStatus(
    gameNumber: number,
    status: string,
    verifiedWord?: string,
    confidence?: number,
    sources?: string[]
  ): Promise<boolean> {
    try {
      const data = this.readData()
      const predictionIndex = data.predictions.findIndex(p => p.game_number === gameNumber)
      
      if (predictionIndex === -1) {
        return false
      }

      data.predictions[predictionIndex] = {
        ...data.predictions[predictionIndex],
        status: status as any,
        verified_word: verifiedWord || data.predictions[predictionIndex].verified_word,
        confidence_score: confidence || data.predictions[predictionIndex].confidence_score,
        verification_sources: sources || data.predictions[predictionIndex].verification_sources,
        updated_at: new Date().toISOString()
      }

      this.writeData(data)
      return true
    } catch (error) {
      console.error('更新预测状态失败:', error)
      return false
    }
  }

  async getVerificationSources(): Promise<any[]> {
    return [
      { name: 'tomsguide', weight: 1.0, active: true },
      { name: 'techradar', weight: 0.9, active: true },
      { name: 'historical', weight: 1.0, active: true }
    ]
  }
}

export { WordlePredictionDBFallback }