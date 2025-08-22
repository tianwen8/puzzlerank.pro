const { WordlePredictionDB } = require('../lib/database/wordle-prediction-db.ts');

async function checkRecentData() {
  console.log('🔍 检查最近几天的数据状态...');
  
  try {
    // 检查今天的数据
    const today = await WordlePredictionDB.getTodayPrediction();
    console.log('📅 今天的数据:', today);
    
    // 检查最近5天的数据
    const currentGameNumber = 1525; // 今天是8月22日，游戏编号1525
    
    for (let i = 0; i < 5; i++) {
      const gameNumber = currentGameNumber - i;
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`\n🎯 检查游戏 #${gameNumber} (${dateStr}):`);
      
      // 这里需要实现获取特定游戏编号数据的方法
      // 由于WordlePredictionDB可能没有这个方法，我们先检查今天的数据
      if (i === 0) {
        console.log('  状态:', today?.status || '无数据');
        console.log('  答案:', today?.predicted_word || '无答案');
        console.log('  置信度:', today?.confidence_score || 0);
        console.log('  更新时间:', today?.updated_at || '无');
      }
    }
    
  } catch (error) {
    console.error('❌ 检查数据时出错:', error);
  }
}

checkRecentData();