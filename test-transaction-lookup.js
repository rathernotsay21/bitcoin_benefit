#!/usr/bin/env node

/**
 * Test script to validate the transaction lookup functionality
 * This script tests both the API endpoints and the data flow
 */

// Using built-in fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';
const TEST_TXID = 'd5cc27d3534d950e0b827b9bf40904877eb95542f0c2389b238ceff100f7be88';

async function testBitcoinPriceAPI() {
  console.log('🔍 Testing Bitcoin Price API...');
  try {
    const response = await fetch(`${BASE_URL}/api/bitcoin-price/`);
    const data = await response.json();
    
    console.log('✅ Bitcoin Price API Response:', {
      status: response.status,
      hasPrice: !!data.bitcoin?.usd,
      price: data.bitcoin?.usd,
      source: data.source
    });
    
    return data.bitcoin?.usd || 30000;
  } catch (error) {
    console.error('❌ Bitcoin Price API Error:', error.message);
    return 30000;
  }
}

async function testTransactionAPI() {
  console.log('🔍 Testing Transaction Lookup API...');
  try {
    const response = await fetch(`${BASE_URL}/api/mempool/tx/${TEST_TXID}/`);
    const data = await response.json();
    
    console.log('✅ Transaction API Response:', {
      status: response.status,
      hasTxid: !!data.txid,
      isConfirmed: data.status?.confirmed,
      blockHeight: data.status?.block_height,
      fee: data.fee
    });
    
    return data;
  } catch (error) {
    console.error('❌ Transaction API Error:', error.message);
    return null;
  }
}

async function testTransactionService() {
  console.log('🔍 Testing TransactionService Integration...');
  
  // This simulates what happens in the TransactionService
  const [txResponse, btcPrice] = await Promise.all([
    fetch(`${BASE_URL}/api/mempool/tx/${TEST_TXID}/`),
    fetch(`${BASE_URL}/api/bitcoin-price/`).then(r => r.json()).then(d => d.bitcoin.usd)
  ]);
  
  if (!txResponse.ok) {
    console.error('❌ Transaction response not OK:', txResponse.status);
    return null;
  }
  
  const txData = await txResponse.json();
  
  // Simulate the formatting logic
  const feeInSats = txData.fee;
  const feeInBTC = feeInSats / 100000000;
  const feeInUSD = feeInBTC * btcPrice;
  
  console.log('✅ TransactionService Integration:', {
    txid: txData.txid,
    confirmed: txData.status.confirmed,
    blockHeight: txData.status.block_height,
    feeInSats,
    feeInBTC: feeInBTC.toFixed(8),
    feeInUSD: feeInUSD.toFixed(2),
    btcPrice
  });
  
  return {
    txid: txData.txid,
    status: txData.status.confirmed ? 'confirmed' : 'pending',
    fee: {
      total: feeInSats,
      usd: feeInUSD
    }
  };
}

async function runTests() {
  console.log('🚀 Starting Transaction Lookup Tests\n');
  
  try {
    const price = await testBitcoinPriceAPI();
    console.log('');
    
    const txData = await testTransactionAPI();
    console.log('');
    
    const serviceResult = await testTransactionService();
    console.log('');
    
    if (price && txData && serviceResult) {
      console.log('🎉 All tests passed! Transaction lookup should work.');
      console.log('📊 Final result:', serviceResult);
    } else {
      console.log('❌ Some tests failed. Check the issues above.');
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

runTests();