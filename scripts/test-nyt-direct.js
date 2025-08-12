const https = require('https');

function testNYTAPI(dateStr) {
  return new Promise((resolve, reject) => {
    const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
    console.log(`Testing NYT API: ${url}`);
    
    const options = {
      hostname: 'www.nytimes.com',
      port: 443,
      path: `/svc/wordle/v2/${dateStr}.json`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('Success! Data received:', jsonData);
            resolve(jsonData);
          } else {
            console.log('Error response:', data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.log('JSON Parse Error:', error.message);
          console.log('Raw data:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('Request Error:', error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.log('Request Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.setTimeout(10000);
    req.end();
  });
}

// Test with today's date
const today = new Date().toISOString().split('T')[0];
console.log(`Testing with date: ${today}`);

testNYTAPI(today)
  .then(data => {
    console.log('\n=== SUCCESS ===');
    console.log(`Game Number: ${data.days_since_launch}`);
    console.log(`Answer: ${data.solution}`);
    console.log(`Date: ${data.print_date}`);
  })
  .catch(error => {
    console.log('\n=== FAILED ===');
    console.log('Error:', error.message);
  });