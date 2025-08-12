const { request } = require('undici');

async function testUndici() {
  const dateStr = '2025-08-12';
  const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
  
  console.log('🚀 Testing NYT API with Undici library...');
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    console.log('📤 Making request with Undici...');
    
    const { statusCode, headers, body } = await request(url, {
      method: 'GET',
      headers: {
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
      bodyTimeout: 30000,
      headersTimeout: 30000
    });
    
    console.log(`📥 Response Status: ${statusCode}`);
    console.log(`📥 Response Headers:`, headers);
    
    if (statusCode === 200) {
      const responseText = await body.text();
      console.log(`📄 Raw Response: ${responseText}`);
      
      try {
        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS! Parsed JSON:');
        console.log(`   ID: ${data.id}`);
        console.log(`   Solution: ${data.solution}`);
        console.log(`   Print Date: ${data.print_date}`);
        console.log(`   Days Since Launch: ${data.days_since_launch}`);
        console.log(`   Editor: ${data.editor}`);
        
        console.log('\n🎉 Undici successfully accessed NYT API!');
        console.log('This method can be used in the production system.');
        
      } catch (parseError) {
        console.log(`❌ JSON Parse Error: ${parseError.message}`);
        console.log(`Raw response: ${responseText}`);
      }
    } else {
      console.log(`❌ HTTP Error: ${statusCode}`);
      const errorText = await body.text();
      console.log(`Error response: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Undici Request Failed: ${error.message}`);
    console.log(`Error code: ${error.code}`);
    console.log(`Error details:`, error);
    
    // 提供诊断建议
    console.log('\n🔍 Diagnostic Information:');
    if (error.message.includes('timeout')) {
      console.log('- Request timeout: Network connectivity issue');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('- DNS resolution failed');
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.log('- Connection refused by server');
    }
    if (error.message.includes('certificate')) {
      console.log('- SSL/TLS certificate issue');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Check network connectivity');
    console.log('2. Try using a VPN or proxy');
    console.log('3. Check firewall settings');
    console.log('4. Consider using a proxy service in production');
  }
}

testUndici();