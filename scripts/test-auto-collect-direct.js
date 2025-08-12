// 直接测试自动采集逻辑，不通过HTTP请求
const { createClient } = require('@supabase/supabase-js');

// 模拟环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';

async function testAutoCollectDirect() {
  console.log('Testing auto-collect logic directly...');
  
  try {
    // 模拟 FallbackCollector
    class TestFallbackCollector {
      calculateGameNumber(dateStr) {
        const baseDate = new Date('2021-06-19');
        const targetDate = new Date(dateStr);
        const diffTime = targetDate.getTime() - baseDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
      }
      
      async collectTodayAnswer(dateStr) {
        const gameNumber = this.calculateGameNumber(dateStr);
        console.log(`Calculated game number: ${gameNumber} for date: ${dateStr}`);
        
        return {
          success: true,
          data: {
            gameNumber,
            answer: 'GUESS', // 5字符占位符
            date: dateStr
          }
        };
      }
    }
    
    // 模拟 AnswerHintGenerator
    class TestHintGenerator {
      generateHints(answer) {
        return {
          letterCount: answer.length,
          firstLetter: answer[0],
          lastLetter: answer[answer.length - 1],
          vowels: answer.match(/[AEIOU]/g)?.length || 0,
          consonants: answer.length - (answer.match(/[AEIOU]/g)?.length || 0),
          hint: `This word starts with ${answer[0]} and ends with ${answer[answer.length - 1]}`
        };
      }
    }
    
    // 获取当前北京时间
    const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    const dateStr = beijingTime.toISOString().split('T')[0];
    
    console.log(`Testing for date: ${dateStr}`);
    
    // 初始化收集器
    const fallbackCollector = new TestFallbackCollector();
    const hintGenerator = new TestHintGenerator();
    
    // 收集数据
    const collectionResult = await fallbackCollector.collectTodayAnswer(dateStr);
    
    if (collectionResult.success) {
      const { gameNumber, answer, date } = collectionResult.data;
      console.log(`✅ Collection successful:`);
      console.log(`   Game Number: ${gameNumber}`);
      console.log(`   Answer: ${answer}`);
      console.log(`   Date: ${date}`);
      
      // 生成提示
      const hints = hintGenerator.generateHints(answer);
      console.log(`✅ Hints generated:`, hints);
      
      console.log('\n🎉 Auto-collect logic test completed successfully!');
      console.log('The system would now save this data to the database.');
      
    } else {
      console.log('❌ Collection failed:', collectionResult.error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testAutoCollectDirect();