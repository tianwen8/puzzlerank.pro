// Simple test for NYT API
const https = require('https');

function testNYTAPI(dateStr) {
  return new Promise((resolve, reject) => {
    const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
    
    console.log(`Testing NYT API for date: ${dateStr}`);
    console.log(`URL: ${url}`);
    
    const options = {
      hostname: 'www.nytimes.com',
      path: `/svc/wordle/v2/${dateStr}.json`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Success:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function runTests() {
  const today = new Date();
  const beijingTime = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const dateStr = beijingTime.toISOString().split('T')[0];
  
  console.log('Current Beijing time:', beijingTime.toISOString());
  console.log('Date string:', dateStr);
  
  try {
    await testNYTAPI(dateStr);
    
    // Test yesterday as well
    const yesterday = new Date(beijingTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log('\n--- Testing Yesterday ---');
    await testNYTAPI(yesterdayStr);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();