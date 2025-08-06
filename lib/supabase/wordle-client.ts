// Supabase Wordle答案数据库客户端
import { createClient } from '@supabase/supabase-js';

// Wordle答案数据库类型定义
export interface WordleAnswerRow {
  id?: number;
  game_number: number;
  date: string;
  word: string;
  verified: boolean;
  sources: string; // JSON字符串
  created_at?: string;
  updated_at?: string;
  verification_time?: string;
  confidence_score: number;
  category: string;
  difficulty: string;
}

export interface WordleSourceRow {
  id?: number;
  game_number: number;
  source_name: string;
  word: string;
  url?: string;
  scraped_at?: string;
  success: boolean;
  raw_data?: string;
}

// 使用环境变量或默认配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

// Wordle数据库操作类
export class SupabaseWordleDB {
  
  // 获取今日答案
  async getTodayAnswer(): Promise<WordleAnswerRow | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('wordle_answers')
      .select('*')
      .eq('date', today)
      .order('confidence_score', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('获取今日答案失败:', error);
      return null;
    }
    
    return data;
  }

  // 根据游戏编号获取答案
  async getAnswerByGameNumber(gameNumber: number): Promise<WordleAnswerRow | null> {
    const { data, error } = await supabase
      .from('wordle_answers')
      .select('*')
      .eq('game_number', gameNumber)
      .single();
    
    if (error) {
      console.error(`获取游戏#${gameNumber}答案失败:`, error);
      return null;
    }
    
    return data;
  }

  // 获取历史答案
  async getHistoricalAnswers(days: number = 30): Promise<WordleAnswerRow[]> {
    const { data, error } = await supabase
      .from('wordle_answers')
      .select('*')
      .lt('date', new Date().toISOString().split('T')[0])
      .order('game_number', { ascending: false })
      .limit(days);
    
    if (error) {
      console.error('获取历史答案失败:', error);
      return [];
    }
    
    return data || [];
  }

  // 插入或更新答案
  async upsertAnswer(answer: Omit<WordleAnswerRow, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wordle_answers')
        .upsert({
          game_number: answer.game_number,
          date: answer.date,
          word: answer.word.toUpperCase(),
          verified: answer.verified,
          sources: answer.sources,
          confidence_score: answer.confidence_score,
          category: answer.category,
          difficulty: answer.difficulty,
          verification_time: answer.verification_time || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'game_number'
        });

      if (error) {
        console.error('更新答案失败:', error);
        return false;
      }

      console.log(`✅ 更新答案: #${answer.game_number} ${answer.word} (${answer.verified ? '已验证' : '未验证'})`);
      return true;
    } catch (error) {
      console.error('更新答案异常:', error);
      return false;
    }
  }

  // 记录数据源抓取结果
  async recordSourceData(sourceRecord: Omit<WordleSourceRow, 'id' | 'scraped_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wordle_sources')
        .insert({
          game_number: sourceRecord.game_number,
          source_name: sourceRecord.source_name,
          word: sourceRecord.word.toUpperCase(),
          url: sourceRecord.url,
          success: sourceRecord.success,
          raw_data: sourceRecord.raw_data,
          scraped_at: new Date().toISOString()
        });

      if (error) {
        console.error('记录数据源失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('记录数据源异常:', error);
      return false;
    }
  }

  // 获取最新的游戏编号
  async getLatestGameNumber(): Promise<number> {
    const { data, error } = await supabase
      .from('wordle_answers')
      .select('game_number')
      .order('game_number', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return 1500; // 默认起始编号
    }
    
    return data.game_number;
  }

  // 计算今日应该的游戏编号
  calculateTodayGameNumber(): number {
    // 根据实际情况，2025-08-06 应该是 #1509 (GROAN)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 手动校正：2025-08-06 = #1509
    if (todayStr === '2025-08-06') {
      return 1509;
    }
    
    // 基于 2025-08-06 = #1509 计算其他日期
    const baseDate = new Date('2025-08-06');
    const baseGameNumber = 1509;
    const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return baseGameNumber + daysDiff;
  }

  // 数据库统计信息
  async getStats(): Promise<{ totalAnswers: number; verifiedAnswers: number; latestGameNumber: number }> {
    try {
      const [totalResult, verifiedResult] = await Promise.all([
        supabase.from('wordle_answers').select('*', { count: 'exact', head: true }),
        supabase.from('wordle_answers').select('*', { count: 'exact', head: true }).eq('verified', true)
      ]);

      const latest = await this.getLatestGameNumber();

      return {
        totalAnswers: totalResult.count || 0,
        verifiedAnswers: verifiedResult.count || 0,
        latestGameNumber: latest
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return { totalAnswers: 0, verifiedAnswers: 0, latestGameNumber: 1500 };
    }
  }

  // 初始化历史数据
  async initializeHistoricalData(): Promise<void> {
    console.log('🚀 初始化Wordle历史数据...');
    
    const historicalData = [
      // 今天的答案
      { game_number: 1509, date: '2025-08-06', word: 'GROAN', category: 'Emotions', difficulty: 'Medium' },
      // 最近的历史答案
      { game_number: 1508, date: '2025-08-05', word: 'STORK', category: 'Animals', difficulty: 'Medium' },
      { game_number: 1507, date: '2025-08-04', word: 'RIGID', category: 'Concepts', difficulty: 'Medium' },
      { game_number: 1506, date: '2025-08-03', word: 'LUMPY', category: 'Concepts', difficulty: 'Medium' },
      { game_number: 1505, date: '2025-08-02', word: 'DAUNT', category: 'Concepts', difficulty: 'Hard' },
      { game_number: 1504, date: '2025-08-01', word: 'BANJO', category: 'Music', difficulty: 'Medium' },
      { game_number: 1503, date: '2025-07-31', word: 'FRILL', category: 'Fashion', difficulty: 'Medium' },
      { game_number: 1502, date: '2025-07-30', word: 'ASSAY', category: 'Science', difficulty: 'Hard' },
      { game_number: 1501, date: '2025-07-29', word: 'OMEGA', category: 'Greek', difficulty: 'Medium' },
      { game_number: 1500, date: '2025-07-28', word: 'SAVVY', category: 'Concepts', difficulty: 'Medium' },
      // 更多历史数据
      { game_number: 1499, date: '2025-07-27', word: 'WHOLE', category: 'Concepts', difficulty: 'Easy' },
      { game_number: 1498, date: '2025-07-26', word: 'HAUNT', category: 'Concepts', difficulty: 'Medium' },
      { game_number: 1497, date: '2025-07-25', word: 'GOFER', category: 'Jobs', difficulty: 'Medium' },
      { game_number: 1496, date: '2025-07-24', word: 'QUAKE', category: 'Nature', difficulty: 'Medium' },
      { game_number: 1495, date: '2025-07-23', word: 'WATER', category: 'Nature', difficulty: 'Easy' },
      { game_number: 1494, date: '2025-07-22', word: 'BURNT', category: 'Concepts', difficulty: 'Medium' },
      { game_number: 1493, date: '2025-07-21', word: 'TIZZY', category: 'Emotions', difficulty: 'Hard' },
      { game_number: 1492, date: '2025-07-20', word: 'BLANK', category: 'Concepts', difficulty: 'Easy' },
      { game_number: 1491, date: '2025-07-19', word: 'SWORD', category: 'Objects', difficulty: 'Medium' },
      { game_number: 1490, date: '2025-07-18', word: 'LORIS', category: 'Animals', difficulty: 'Hard' }
    ];

    for (const data of historicalData) {
      await this.upsertAnswer({
        game_number: data.game_number,
        date: data.date,
        word: data.word,
        verified: true,
        sources: JSON.stringify(['tomsguide', 'techradar']),
        confidence_score: data.game_number === 1509 ? 100 : 95,
        category: data.category,
        difficulty: data.difficulty,
        verification_time: new Date().toISOString()
      });
    }

    console.log('✅ 历史数据初始化完成');
  }
}

// 单例模式，确保全局只有一个数据库实例
let dbInstance: SupabaseWordleDB | null = null;

export function getSupabaseWordleDB(): SupabaseWordleDB {
  if (!dbInstance) {
    dbInstance = new SupabaseWordleDB();
  }
  return dbInstance;
}

export default SupabaseWordleDB;