// Simple local test for the optimized collection system
async function testLocalCollection() {
  console.log('🧪 Testing Local Collection System...');
  
  try {
    // Test the optimized auto-collect endpoint
    const response = await fetch('http://localhost:3000/api/wordle/auto-collect?dry=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Collection test successful!');
      if (result.data) {
        console.log(`Game #${result.data.gameNumber}: ${result.data.answer}`);
      }
    } else {
      console.log('❌ Collection test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLocalCollection();