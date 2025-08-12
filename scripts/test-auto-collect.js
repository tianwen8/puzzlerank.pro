const fetch = require('node-fetch');

async function testAutoCollect() {
  try {
    console.log('Testing auto-collect API...');
    
    const response = await fetch('http://localhost:3000/api/wordle/auto-collect', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Auto-collect test passed!');
      console.log(`Game #${result.data.gameNumber}: ${result.data.answer}`);
      console.log(`Hints: ${JSON.stringify(result.data.hints, null, 2)}`);
    } else {
      console.log('❌ Auto-collect test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Test NYT API directly
async function testNYTAPI() {
  try {
    console.log('\nTesting NYT API directly...');
    
    const today = new Date();
    const beijingTime = new Date(today.getTime() + 8 * 60 * 60 * 1000);
    const dateStr = beijingTime.toISOString().split('T')[0];
    
    const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NYT API response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ NYT API failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ NYT API test error:', error.message);
  }
}

async function runTests() {
  await testNYTAPI();
  await testAutoCollect();
}

runTests();