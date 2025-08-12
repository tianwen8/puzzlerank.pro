const https = require('https');

// 测试不同的请求方式
async function testDifferentMethods() {
  const dateStr = '2025-08-12';
  const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
  
  console.log(`Testing NYT API: ${url}`);
  console.log('='.repeat(50));
  
  // 方法1: 最简单的请求
  console.log('\n1. Testing with minimal headers...');
  await testWithHeaders(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  // 方法2: 模拟浏览器请求
  console.log('\n2. Testing with browser-like headers...');
  await testWithHeaders(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nytimes.com/games/wordle/index.html',
    'Origin': 'https://www.nytimes.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Cache-Control': 'no-cache'
  });
  
  // 方法3: 不使用 HTTPS 模块，使用 fetch (如果可用)
  console.log('\n3. Testing with fetch (if available)...');
  try {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetch success:', data);
      } else {
        console.log('❌ Fetch failed:', response.status, response.statusText);
      }
    } else {
      console.log('Fetch not available in this environment');
    }
  } catch (error) {
    console.log('❌ Fetch error:', error.message);
  }
}

function testWithHeaders(url, headers) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: headers,
      timeout: 15000
    };
    
    console.log('Request headers:', headers);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('✅ Success! Data:', jsonData);
          } else {
            console.log('❌ HTTP Error:', res.statusCode, data);
          }
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw response:', data.substring(0, 200));
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log('❌ Request Timeout');
      req.destroy();
      resolve();
    });
    
    req.setTimeout(15000);
    req.end();
  });
}

testDifferentMethods();