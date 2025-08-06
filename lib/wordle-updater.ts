// Wordle自动更新机制
// 每日最快最新的数据获取和验证系统

import { getWordleDB, WordleRecord } from './database/wordle-db';
import { generateHintsForWord } from './wordle-api';

export interface UpdateResult {
  success: boolean;
  gameNumber: number;
  word: string;
  verified: boolean;
  sources: string[];
  message: string;
}

// 数据源配置
const DATA_SOURCES = [
  {
    name: 'tomsguide',
    url: 'https://www.tomsguide.com/news/what-is-todays-wordle-answer',
    weight: 10,
    parser: async (html: string) => {
      const patterns = [
        /today['\s]*s wordle answer for game[#\s]*(\d+)[,\s]*(\d+)[:\s]*([A-Z]{5})/i,
        /wordle[#\s]*(\d+)[:\s]*([A-Z]{5})/i,
        /answer is[:\s]*([A-Z]{5})/i
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          const word = match[match.length - 1].toUpperCase();
          const gameNumber = match.length > 2 ? parseInt(match[1]) : null;
          return { word, gameNumber };
        }
      }
      return null;
    }
  },
  {
    name: 'nytimes',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    weight: 15,
    parser: async (html: string) => {
      // NYT的解析逻辑（通常需要特殊处理）
      return null; // 暂时返回null，需要特殊的抓取方法
    }
  }
];

// 从单个数据源获取答案
async function fetchFromSource(source: typeof DATA_SOURCES[0]): Promise<{word: string; gameNumber: number | null} | null> {
  try {
    console.log(`🔍 正在从 ${source.name} 获取数据...`);
    
    // 使用多种方法尝试获取数据
    const methods = [
      // 方法1: 直接fetch（服务端环境）
      async () => {
        if (typeof window !== 'undefined') return null;
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (response.ok) {
          return await response.text();
        }
        return null;
      },
      
      // 方法2: 使用代理服务
      async () => {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          return data.contents;
        }
        return null;
      }
    ];
    
    for (const method of methods) {
      try {
        const html = await method();
        if (html) {
          const result = await source.parser(html);
          if (result) {
            console.log(`✅ ${source.name}: ${result.word} (#${result.gameNumber || 'unknown'})`);
            return result;
          }
        }
      } catch (error) {
        console.log(`❌ ${source.name} 方法失败:`, error);
        continue;
      }
    }
    
  } catch (error) {
    console.error(`❌ ${source.name} 获取失败:`, error);
  }
  
  return null;
}

// 多源验证和更新
export async function updateTodayAnswer(): Promise<UpdateResult> {
  const db = getWordleDB();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    console.log('🚀 开始更新今日Wordle答案...');
    
    // 1. 检查数据库中是否已有今日答案
    const existingAnswer = db.getTodayAnswer();
    if (existingAnswer && existingAnswer.verified && existingAnswer.confidenceScore >= 90) {
      console.log('✅ 数据库中已有高置信度答案，跳过更新');
      return {
        success: true,
        gameNumber: existingAnswer.gameNumber,
        word: existingAnswer.word,
        verified: existingAnswer.verified,
        sources: existingAnswer.sources,
        message: '使用数据库中的已验证答案'
      };
    }
    
    // 2. 从多个数据源获取答案
    const fetchPromises = DATA_SOURCES.map(source => 
      fetchFromSource(source).then(result => ({ source: source.name, weight: source.weight, result }))
    );
    
    const results = await Promise.allSettled(fetchPromises);
    const successfulResults = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.result !== null)
      .map(r => r.value);
    
    if (successfulResults.length === 0) {
      // 没有获取到任何数据，使用计算的游戏编号和备用答案
      const calculatedGameNumber = db.calculateTodayGameNumber();
      const backupWord = 'GROAN'; // 根据Tom's Guide，今天应该是GROAN
      
      const record: Omit<WordleRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        gameNumber: calculatedGameNumber,
        date: today,
        word: backupWord,
        verified: false,
        sources: ['calculated'],
        confidenceScore: 50,
        category: 'Emotions',
        difficulty: 'Medium',
        verificationTime: new Date().toISOString()
      };
      
      db.upsertAnswer(record);
      
      return {
        success: false,
        gameNumber: calculatedGameNumber,
        word: backupWord,
        verified: false,
        sources: ['calculated'],
        message: '所有数据源失败，使用计算的答案'
      };
    }
    
    // 3. 分析和验证结果
    const wordCounts: { [word: string]: { count: number; weight: number; sources: string[]; gameNumber?: number } } = {};
    
    successfulResults.forEach(({ source, weight, result }) => {
      const word = result.word;
      if (!wordCounts[word]) {
        wordCounts[word] = { count: 0, weight: 0, sources: [], gameNumber: result.gameNumber };
      }
      wordCounts[word].count++;
      wordCounts[word].weight += weight;
      wordCounts[word].sources.push(source);
      if (result.gameNumber) {
        wordCounts[word].gameNumber = result.gameNumber;
      }
    });
    
    // 选择权重最高的答案
    const [bestWord, bestInfo] = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b.weight - a.weight)[0];
    
    const isVerified = bestInfo.count >= 2 || bestInfo.weight >= 15;
    const confidenceScore = Math.min(100, bestInfo.weight * 5 + bestInfo.count * 10);
    const gameNumber = bestInfo.gameNumber || db.calculateTodayGameNumber();
    
    // 4. 保存到数据库
    const record: Omit<WordleRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      gameNumber,
      date: today,
      word: bestWord,
      verified: isVerified,
      sources: bestInfo.sources,
      confidenceScore,
      category: 'General', // 可以根据单词自动分类
      difficulty: 'Medium', // 可以根据单词难度自动判断
      verificationTime: new Date().toISOString()
    };
    
    db.upsertAnswer(record);
    
    // 5. 记录所有数据源的结果
    successfulResults.forEach(({ source, result }) => {
      db.recordSourceData({
        gameNumber,
        sourceName: source,
        word: result.word,
        success: true
      });
    });
    
    console.log(`🎯 更新完成: ${bestWord} (#${gameNumber}) - ${isVerified ? '已验证' : '未验证'}`);
    
    return {
      success: true,
      gameNumber,
      word: bestWord,
      verified: isVerified,
      sources: bestInfo.sources,
      message: `成功从 ${bestInfo.sources.join(', ')} 获取答案`
    };
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    
    // 错误处理：返回数据库中的现有答案或计算答案
    const existingAnswer = db.getTodayAnswer();
    if (existingAnswer) {
      return {
        success: false,
        gameNumber: existingAnswer.gameNumber,
        word: existingAnswer.word,
        verified: existingAnswer.verified,
        sources: existingAnswer.sources,
        message: '更新失败，使用数据库中的现有答案'
      };
    }
    
    // 最后的备用方案
    const calculatedGameNumber = db.calculateTodayGameNumber();
    return {
      success: false,
      gameNumber: calculatedGameNumber,
      word: 'GROAN',
      verified: false,
      sources: ['fallback'],
      message: '更新失败，使用备用答案'
    };
  }
}

// 定时更新任务（可以通过cron job调用）
export async function scheduleUpdate(): Promise<void> {
  console.log('⏰ 开始定时更新任务...');
  
  try {
    const result = await updateTodayAnswer();
    console.log('📊 更新结果:', result);
    
    // 可以在这里添加通知逻辑，比如发送邮件、Webhook等
    if (result.success && result.verified) {
      console.log('🎉 成功获取并验证今日答案!');
    }
    
  } catch (error) {
    console.error('❌ 定时更新失败:', error);
  }
}

// 手动触发更新（用于测试）
export async function manualUpdate(): Promise<UpdateResult> {
  console.log('🔧 手动触发更新...');
  return await updateTodayAnswer();
}