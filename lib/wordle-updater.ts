// Wordle自动更新机制
// 每日最快最新的数据获取和验证系统

import { WordlePredictionDB } from './database/wordle-prediction-db';
import { NYTOfficialCollector } from './nyt-official-collector';

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
  const today = new Date().toISOString().split('T')[0];
  
  try {
    console.log('🚀 开始更新今日Wordle答案...');
    
    // 1. 检查数据库中是否已有今日答案
    const existingAnswer = await WordlePredictionDB.getTodayPrediction();
    if (existingAnswer && existingAnswer.status === 'verified' && existingAnswer.confidence_score >= 0.9) {
      console.log('✅ 数据库中已有高置信度答案，跳过更新');
      return {
        success: true,
        gameNumber: existingAnswer.game_number,
        word: existingAnswer.verified_word || existingAnswer.predicted_word || '',
        verified: true,
        sources: existingAnswer.verification_sources || [],
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
      // 没有获取到任何数据，使用NYT官方API作为备用
      const nytCollector = new NYTOfficialCollector();
      const nytResult = await nytCollector.collectTodayAnswer(today);
      
      if (nytResult.success && nytResult.data) {
        const prediction = {
          game_number: nytResult.data.gameNumber,
          date: today,
          predicted_word: nytResult.data.answer,
          verified_word: nytResult.data.answer,
          status: 'verified' as const,
          confidence_score: 1.0,
          verification_sources: ['NYT Official API'],
          hints: {
            category: 'daily',
            difficulty: 'confirmed',
            clues: [`Today's Wordle answer is ${nytResult.data.answer}`],
            letterHints: generateLetterHints(nytResult.data.answer)
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await WordlePredictionDB.upsertPrediction(prediction);
        
        return {
          success: true,
          gameNumber: nytResult.data.gameNumber,
          word: nytResult.data.answer,
          verified: true,
          sources: ['NYT Official API'],
          message: '使用NYT官方API获取答案'
        };
      }
      
      return {
        success: false,
        gameNumber: 0,
        word: '',
        verified: false,
        sources: [],
        message: '所有数据源失败'
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
    const confidenceScore = Math.min(1.0, (bestInfo.weight * 0.05 + bestInfo.count * 0.1));
    
    // 计算游戏编号
    const baseDate = new Date('2021-06-19'); // Wordle开始日期
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const gameNumber = bestInfo.gameNumber || diffDays;
    
    // 4. 保存到数据库
    const status = isVerified ? 'verified' : 'predicted';
    const prediction = {
      game_number: gameNumber,
      date: today,
      predicted_word: bestWord,
      verified_word: isVerified ? bestWord : undefined,
      status: status as 'verified' | 'predicted',
      confidence_score: confidenceScore,
      verification_sources: bestInfo.sources,
      hints: {
        category: 'daily',
        difficulty: 'medium',
        clues: [`Today's Wordle answer might be ${bestWord}`],
        letterHints: generateLetterHints(bestWord)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await WordlePredictionDB.upsertPrediction(prediction);
    
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
    const existingAnswer = await WordlePredictionDB.getTodayPrediction();
    if (existingAnswer) {
      return {
        success: false,
        gameNumber: existingAnswer.game_number,
        word: existingAnswer.verified_word || existingAnswer.predicted_word || '',
        verified: existingAnswer.status === 'verified',
        sources: existingAnswer.verification_sources || [],
        message: '更新失败，使用数据库中的现有答案'
      };
    }
    
    // 最后的备用方案
    const baseDate = new Date('2021-06-19');
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      success: false,
      gameNumber: diffDays,
      word: '',
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

// 手动触发更新（用于测试和补采历史数据）
export async function manualUpdate(gameNumber?: number): Promise<UpdateResult> {
  console.log('🔧 手动触发更新...');
  
  if (gameNumber) {
    // 补采指定游戏编号的数据
    return await updateSpecificAnswer(gameNumber);
  }
  
  return await updateTodayAnswer();
}

// 补采指定游戏编号的答案
async function updateSpecificAnswer(gameNumber: number): Promise<UpdateResult> {
  console.log(`🎯 补采游戏编号 #${gameNumber} 的答案...`);
  
  try {
    // 计算对应的日期
    const baseDate = new Date('2025-08-07');
    const baseGameNumber = 1510;
    const diffDays = gameNumber - baseGameNumber;
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + diffDays);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`📅 游戏编号 #${gameNumber} 对应日期: ${dateStr}`);
    
    // 使用NYT官方API获取答案
    const nytCollector = new NYTOfficialCollector();
    const result = await nytCollector.collectTodayAnswer(dateStr);
    
    if (result.success && result.data) {
      console.log(`✅ NYT官方API成功获取: ${result.data.answer}`);
      
      // 保存到数据库
      const prediction = {
        game_number: gameNumber,
        date: dateStr,
        predicted_word: result.data.answer,
        verified_word: result.data.answer,
        status: 'verified' as const,
        confidence_score: 1.0,
        verification_sources: ['NYT Official API'],
        hints: {
          category: 'daily',
          difficulty: 'confirmed',
          clues: [`Today's Wordle answer is ${result.data.answer}`],
          letterHints: generateLetterHints(result.data.answer)
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const saved = await WordlePredictionDB.upsertPrediction(prediction);
      
      if (saved) {
        console.log(`💾 数据库更新成功: #${gameNumber} = ${result.data.answer}`);
        return {
          success: true,
          gameNumber: gameNumber,
          word: result.data.answer,
          verified: true,
          sources: ['NYT Official API'],
          message: `成功补采 #${gameNumber} 的答案: ${result.data.answer}`
        };
      } else {
        throw new Error('数据库保存失败');
      }
      
    } else {
      throw new Error(result.error || 'NYT API获取失败');
    }
    
  } catch (error) {
    console.error(`❌ 补采 #${gameNumber} 失败:`, error);
    return {
      success: false,
      gameNumber: gameNumber,
      word: '',
      verified: false,
      sources: [],
      message: `补采失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

// 生成字母提示
function generateLetterHints(word: string): string[] {
  if (!word || word.length !== 5) return [];
  
  const hints = [];
  const letters = word.split('');
  
  // 第一个字母提示
  hints.push(`Starts with "${letters[0]}"`);
  
  // 包含的字母
  const uniqueLetters = [...new Set(letters)].sort();
  if (uniqueLetters.length < 5) {
    hints.push(`Contains letters: ${uniqueLetters.join(', ')}`);
  }
  
  // 结尾字母提示
  hints.push(`Ends with "${letters[4]}"`);
  
  return hints;
}
