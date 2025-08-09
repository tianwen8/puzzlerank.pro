import { NextRequest, NextResponse } from 'next/server';
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db';
// 保留旧系统作为备用
import { 
  wordlePredictionSystem, 
  getTodayWordlePrediction, 
  getWordleHistory,
  getWordleCandidates 
} from '@/lib/wordle-prediction-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today';

    switch (type) {
      case 'today':
        // 优先使用新的自动化系统
        try {
          const newTodayPrediction = await WordlePredictionDB.getTodayPrediction();
          if (newTodayPrediction) {
            return NextResponse.json({
              gameNumber: newTodayPrediction.game_number,
              date: newTodayPrediction.date,
              word: newTodayPrediction.verified_word || newTodayPrediction.predicted_word,
              status: newTodayPrediction.status,
              confidence: newTodayPrediction.confidence_score,
              verificationSources: newTodayPrediction.verification_sources || [],
              isVerified: newTodayPrediction.status === 'verified',
              hints: newTodayPrediction.hints || {
                category: newTodayPrediction.status === 'verified' ? '已验证答案' : '预测中...',
                difficulty: newTodayPrediction.status === 'verified' ? '中等' : '未知',
                clues: newTodayPrediction.status === 'verified' ? [
                  `今日Wordle答案已通过多源验证`,
                  `置信度: ${Math.round(newTodayPrediction.confidence_score * 100)}%`,
                  `验证来源: ${newTodayPrediction.verification_sources?.length || 0}个`
                ] : ['等待验证中...'],
                letterHints: []
              }
            });
          }
        } catch (error) {
          console.warn('新系统获取今日预测失败，使用备用系统:', error);
        }
        
        // 备用：使用旧的硬编码系统
        const todayPrediction = getTodayWordlePrediction();
        if (!todayPrediction) {
          return NextResponse.json({ error: 'No prediction available for today' }, { status: 404 });
        }
        
        return NextResponse.json({
          gameNumber: todayPrediction.gameNumber,
          date: todayPrediction.date,
          word: todayPrediction.candidateWord,
          status: todayPrediction.status,
          confidence: todayPrediction.confidence,
          verificationSources: todayPrediction.verificationSources,
          isVerified: todayPrediction.status === 'verified',
          hints: {
            category: todayPrediction.status === 'verified' ? 'Emotional Expression' : 'Predicting...',
            difficulty: todayPrediction.status === 'verified' ? 'Medium' : 'Unknown',
            clues: todayPrediction.status === 'verified' ? [
              'A sound expressing dissatisfaction or pain',
              'Commonly used to describe physical or mental discomfort',
              'Five letters, contains vowels O and A'
            ] : ['Awaiting verification...'],
            letterHints: todayPrediction.status === 'verified' ? [
              'G: First letter, clear pronunciation',
              'R: Second letter, rolled sound',
              'O: Middle vowel, full pronunciation',
              'A: Fourth letter, short vowel',
              'N: Final consonant, nasal sound'
            ] : []
          }
        });
      
      case 'history':
        // 优先使用新的自动化系统获取历史数据
        try {
          const historyData = await WordlePredictionDB.getHistoryPredictions(10);
          if (historyData && historyData.length > 0) {
            return NextResponse.json(
              historyData.map(p => ({
                gameNumber: p.game_number,
                date: p.date,
                word: p.verified_word || p.predicted_word,
                status: p.status,
                confidence: p.confidence_score,
                verificationSources: p.verification_sources || []
              }))
            );
          }
        } catch (error) {
          console.warn('新系统获取历史数据失败，使用备用系统:', error);
        }
        
        // 备用：使用旧的硬编码系统
        const historyPredictions = getWordleHistory();
        return NextResponse.json(
          historyPredictions.map(p => ({
            gameNumber: p.gameNumber,
            date: p.date,
            word: p.candidateWord,
            status: p.status,
            confidence: p.confidence,
            verificationSources: p.verificationSources
          }))
        );
      
      case 'candidates':
        const candidates = getWordleCandidates();
        return NextResponse.json(
          candidates.map(p => ({
            gameNumber: p.gameNumber,
            date: p.date,
            candidateWord: p.candidateWord,
            confidence: p.confidence,
            sources: p.verificationSources
          }))
        );
      
      case 'status':
        const systemStatus = wordlePredictionSystem.getSystemStatus();
        return NextResponse.json(systemStatus);
      
      case 'all':
        const [today, history, candidateList] = [
          getTodayWordlePrediction(),
          getWordleHistory(),
          getWordleCandidates()
        ];
        return NextResponse.json({
          today,
          history,
          candidates: candidateList,
          status: wordlePredictionSystem.getSystemStatus()
        });
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Wordle Prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Wordle prediction data' },
      { status: 500 }
    );
  }
}

// POST方法用于手动验证
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameNumber, sources, word } = body;

    if (!gameNumber || !sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const isVerified = await wordlePredictionSystem.verifyCandidate(gameNumber, sources);
    
    return NextResponse.json({
      success: true,
      verified: isVerified,
      gameNumber,
      sources,
      message: isVerified ? 'Verification successful, answer confirmed' : 'Verification failed, more sources needed for confirmation'
    });
  } catch (error) {
    console.error('Wordle verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify Wordle answer' },
      { status: 500 }
    );
  }
}