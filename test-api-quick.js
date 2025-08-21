#!/usr/bin/env node

const testApis = async () => {
  console.log('Testing API endpoints...\n');
  
  // Test mempool fees
  try {
    console.log('1. Testing Mempool Fees API...');
    const response = await fetch('http://localhost:3000/api/mempool/fees/recommended');
    const data = await response.json();
    console.log('✅ Mempool Fees Response:', JSON.stringify(data, null, 2).substring(0, 200));
  } catch (error) {
    console.log('❌ Mempool Fees Error:', error.message);
  }
  
  // Test CoinGecko
  try {
    console.log('\n2. Testing CoinGecko API...');
    const response = await fetch('http://localhost:3000/api/coingecko?endpoint=/simple/price&params=ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    console.log('✅ CoinGecko Response:', JSON.stringify(data, null, 2).substring(0, 200));
  } catch (error) {
    console.log('❌ CoinGecko Error:', error.message);
  }
  
  // Test health check
  try {
    console.log('\n3. Testing Health Check...');
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('✅ Health Check Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }
};

testApis().catch(console.error);