const https = require('https');
const zlib = require('zlib');

async function testNYTFixed() {
  const dateStr = '2025-08-12';
  const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
  
  console.log('🔧 Testing NYT API with fixed configuration...');
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.nytimes.com',
      port: 443,
      path: `/svc/wordle/v2/${dateStr}.json`,
      method: 'GET',
      headers: {
        // 完全模拟浏览器请求头
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html',
        'Origin': 'https://www.nytimes.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // 重要：配置 TLS 选项
      rejectUnauthorized: true,
      secureProtocol: 'TLSv1_2_method',
      timeout: 30000
    };
    
    console.log('📤 Request Headers:');
    Object.entries(options.headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');
    
    const req = https.request(options, (res) => {
      console.log(`📥 Response Status: ${res.statusCode}`);
      console.log(`📥 Response Headers:`);
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log('');
      
      let data = '';
      
      // 处理 gzip 压缩
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        console.log('🗜️  Handling gzip compression...');
        stream = res.pipe(zlib.createGunzip());
      }
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        try {
          if (res.statusCode === 200) {
            console.log(`📄 Raw Response Data: ${data}`);
            const jsonData = JSON.parse(data);
            console.log('✅ SUCCESS! Parsed JSON:');
            console.log(`   ID: ${jsonData.id}`);
            console.log(`   Solution: ${jsonData.solution}`);
            console.log(`   Print Date: ${jsonData.print_date}`);
            console.log(`   Days Since Launch: ${jsonData.days_since_launch}`);
            console.log(`   Editor: ${jsonData.editor}`);
            resolve(jsonData);
          } else {
            console.log(`❌ HTTP Error ${res.statusCode}: ${data}`);
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        } catch (error) {
          console.log(`❌ JSON Parse Error: ${error.message}`);
          console.log(`Raw data: ${data}`);
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
      
      stream.on('error', (error) => {
        console.log(`❌ Stream Error: ${error.message}`);
        reject(error);
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      console.log(`Error code: ${error.code}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.setTimeout(30000);
    req.end();
  });
}

// 运行测试
testNYTFixed()
  .then(data => {
    console.log('\n🎉 NYT API Test SUCCESSFUL!');
    console.log('The fixed configuration works correctly.');
  })
  .catch(error => {
    console.log('\n💥 NYT API Test FAILED!');
    console.log('Error:', error.message);
    
    // 提供诊断建议
    console.log('\n🔍 Diagnostic Suggestions:');
    if (error.message.includes('timeout')) {
      console.log('- Network timeout: Check firewall/proxy settings');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('- DNS resolution failed: Check DNS settings');
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.log('- Connection refused: Check network connectivity');
    }
    if (error.message.includes('certificate')) {
      console.log('- SSL/TLS issue: Check certificate validation');
    }
  });