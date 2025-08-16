// Test script for optimized auto-collection
const fetch = require('node-fetch');

async function testOptimizedCollection() {
  console.log('🧪 Testing Optimized Auto-Collection...');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Dry run with current date logic
  console.log('\n1. Testing dry run (no database write)...');
  try {
    const response = await fetch(`${baseUrl}/api/wordle/auto-collect?dry=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Dry run test passed!');
      if (result.data) {
        console.log(`   Game #${result.data.gameNumber}: ${result.data.answer}`);
        console.log(`   Date tried: ${result.data.dateTried || 'auto-detected'}`);
      }
    } else {
      console.log('❌ Dry run test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Dry run test error:', error.message);
  }
  
  // Test 2: Force specific date (dry run)
  console.log('\n2. Testing forced date (2025-08-15, dry run)...');
  try {
    const response = await fetch(`${baseUrl}/api/wordle/auto-collect?date=2025-08-15&dry=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Forced date test passed!');
      if (result.data) {
        console.log(`   Game #${result.data.gameNumber}: ${result.data.answer}`);
      }
    } else {
      console.log('❌ Forced date test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Forced date test error:', error.message);
  }
  
  // Test 3: Test direct NYT API access
  console.log('\n3. Testing direct NYT API access...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const nytUrl = `https://www.nytimes.com/svc/wordle/v2/${today}.json`;
    
    console.log(`   Trying: ${nytUrl}`);
    
    const response = await fetch(nytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct NYT API access successful!');
      console.log(`   Game #${data.id}: ${data.solution}`);
      console.log(`   Print date: ${data.print_date}`);
    } else {
      console.log(`❌ Direct NYT API failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Direct NYT API test error:', error.message);
  }
  
  // Test 4: Test with authentication (if CRON_SECRET is set)
  if (process.env.CRON_SECRET) {
    console.log('\n4. Testing with authentication...');
    try {
      const response = await fetch(`${baseUrl}/api/wordle/auto-collect?dry=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      });
      
      const result = await response.json();
      console.log('Response status:', response.status);
      
      if (result.success) {
        console.log('✅ Authentication test passed!');
      } else {
        console.log('❌ Authentication test failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Authentication test error:', error.message);
    }
  } else {
    console.log('\n4. Skipping authentication test (CRON_SECRET not set)');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test Summary:');
  console.log('1. Run this script with your local dev server running (npm run dev)');
  console.log('2. Check that dry runs work without errors');
  console.log('3. Verify that the NYT API can be accessed directly');
  console.log('4. If tests pass, the optimized collection should work in production');
  console.log('\nTo test actual database writes, remove the dry=1 parameter');
}

// Test timezone logic
function testTimezoneLogic() {
  console.log('\n🌍 Testing Timezone Logic...');
  
  // Simulate New Zealand timezone
  const nzTime = new Date().toLocaleString('en-US', { timeZone: 'Pacific/Auckland' });
  const usTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const utcTime = new Date().toISOString();
  
  console.log(`UTC Time: ${utcTime}`);
  console.log(`New Zealand Time: ${nzTime}`);
  console.log(`US Eastern Time: ${usTime}`);
  
  // Show what dates would be tried
  const nzDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
  const usDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  
  console.log(`NZ Date (priority): ${nzDate}`);
  console.log(`US Date (fallback): ${usDate}`);
}

async function runAllTests() {
  testTimezoneLogic();
  await testOptimizedCollection();
}

runAllTests().catch(console.error);