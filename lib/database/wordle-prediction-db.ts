import { createClient } from '@supabase/supabase-js'

// 延迟初始化 Supabase 客户端
let supabaseAdmin: any = null

function getSupabaseClient() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please check your .env.local file.')
    }
    
    supabaseAdmin = createClient(supabaseUrl, supabaseKey)
  }
  
  return supabaseAdmin
}

// 导出客户端获取函数
export { getSupabaseClient }

// 数据类型定义
export interface WordlePrediction {
  id: number
  game_number: number
  date: string
  predicted_word?: string
  verified_word?: string
  status: 'candidate' | 'verified' | 'rejected'
  confidence_score: number
  verification_sources: string[]
  hints?: {
    category?: string
    difficulty?: string
    clues?: string[]
    letterHints?: string[]
  }
  created_at: string
  updated_at: string
}

export interface VerificationSource {
  id: number
  name: string
  base_url: string
  selector_config: {
    answer_selector: string
    backup_selectors: string[]
  }
  weight: number
  is_active: boolean
  last_check?: string
  success_rate: number
}

export interface CollectionLog {
  id: number
  game_number: number
  source_name: string
  collected_word?: string
  status: 'success' | 'failed' | 'timeout'
  response_time?: number
  error_message?: string
  raw_data?: any
  created_at: string
}

// 数据库操作类
export class WordlePredictionDB {
  
  // 计算游戏编号（统一的计算方法）
  private static calculateGameNumber(date: string): number {
    // 基于2025-08-07 = #1510计算（从Tom's Guide确认的正确编号）
    const baseDate = new Date('2025-08-07');
    const baseGameNumber = 1510;
    
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return baseGameNumber + diffDays;
  }
  
  // 获取今日预测
  static async getTodayPrediction(): Promise<WordlePrediction | null> {
    const today = new Date().toISOString().split('T')[0]
    const todayGameNumber = this.calculateGameNumber(today)
    
    const { data, error } = await getSupabaseClient()
      .from('wordle_predictions')
      .select('*')
      .eq('date', today)
      .eq('game_number', todayGameNumber)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get today prediction:', error)
      return null
    }
    
    return data
  }
  
  // 获取历史预测（已验证）
  static async getHistoryPredictions(limit = 20): Promise<WordlePrediction[]> {
    const { data, error } = await getSupabaseClient()
      .from('wordle_predictions')
      .select('*')
      .eq('status', 'verified')
      .order('date', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Failed to get history predictions:', error)
      return []
    }
    
    return data || []
  }
  
  // 获取候选预测
  static async getCandidatePredictions(limit = 10): Promise<WordlePrediction[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await getSupabaseClient()
      .from('wordle_predictions')
      .select('*')
      .eq('status', 'candidate')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)
    
    if (error) {
      console.error('Failed to get candidate predictions:', error)
      return []
    }
    
    return data || []
  }
  
  // 创建或更新预测
  static async upsertPrediction(prediction: Partial<WordlePrediction>): Promise<WordlePrediction | null> {
    const { data, error } = await getSupabaseClient()
      .from('wordle_predictions')
      .upsert(prediction, { 
        onConflict: 'game_number',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create/update prediction:', error)
      return null
    }
    
    return data
  }
  
  // 更新预测状态
  static async updatePredictionStatus(
    gameNumber: number, 
    status: 'candidate' | 'verified' | 'rejected',
    verifiedWord?: string,
    confidenceScore?: number,
    sources?: string[]
  ): Promise<boolean> {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    if (verifiedWord) updateData.verified_word = verifiedWord
    if (confidenceScore !== undefined) updateData.confidence_score = confidenceScore
    if (sources) updateData.verification_sources = sources
    
    const { error } = await getSupabaseClient()
      .from('wordle_predictions')
      .update(updateData)
      .eq('game_number', gameNumber)
    
    if (error) {
      console.error('Failed to update prediction status:', error)
      return false
    }
    
    return true
  }
  
  // 获取验证源配置
  static async getVerificationSources(): Promise<VerificationSource[]> {
    const { data, error } = await getSupabaseClient()
      .from('verification_sources')
      .select('*')
      .eq('is_active', true)
      .order('weight', { ascending: false })
    
    if (error) {
      console.error('Failed to get verification sources:', error)
      return []
    }
    
    return data || []
  }
  
  // 记录采集日志
  static async logCollection(log: Omit<CollectionLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('collection_logs')
      .insert(log)
    
    if (error) {
      console.error('Failed to log collection:', error)
    }
  }
  
  // 获取系统配置
  static async getSystemConfig(key: string): Promise<any> {
    const { data, error } = await getSupabaseClient()
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error) {
      console.error(`Failed to get system config (${key}):`, error)
      return null
    }
    
    return data?.value
  }
  
  // 获取统计信息
  static async getStats(): Promise<{
    total: number
    verified: number
    candidates: number
    verificationRate: number
  }> {
    const { data: totalData } = await getSupabaseClient()
      .from('wordle_predictions')
      .select('status')
    
    if (!totalData) {
      return { total: 0, verified: 0, candidates: 0, verificationRate: 0 }
    }
    
    const total = totalData.length
    const verified = totalData.filter((p: any) => p.status === 'verified').length
    const candidates = totalData.filter((p: any) => p.status === 'candidate').length
    const verificationRate = total > 0 ? verified / total : 0
    
    return {
      total,
      verified,
      candidates,
      verificationRate
    }
  }
}