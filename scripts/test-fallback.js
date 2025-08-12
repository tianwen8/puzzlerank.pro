const { FallbackCollector } = require('../lib/fallback-collector.ts');

async function testFallback() {
  console.log('Testing fallback collector...');
  
  const collector = new FallbackCollector();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`Testing with date: ${today}`);
  
  try {
    const result = await collector.collectTodayAnswer(today);
    
    if (result.success) {
      console.log('✅ Fallback collector success!');
      console.log('Data:', result.data);
    } else {
      console.log('❌ Fallback collector failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testFallback();