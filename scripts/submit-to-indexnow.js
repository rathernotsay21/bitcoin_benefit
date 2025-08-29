#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const INDEXNOW_KEY = 'a22a916ab0474727b6815e40d4ade00a';
const PRIMARY_HOST = 'bitcoinbenefits.me';

// IndexNow API endpoints
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

async function parseSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  const parser = new XMLParser();
  const result = parser.parse(sitemapContent);
  
  // Extract URLs from sitemap
  const urls = result.urlset.url
    .map(entry => entry.loc)
    .filter(url => url.includes(PRIMARY_HOST) && !url.includes('www.'));
  
  return urls;
}

async function submitToIndexNow(urls, endpoint) {
  const payload = {
    host: PRIMARY_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${PRIMARY_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      endpoint,
      status: 'error',
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 IndexNow Submission Script');
  console.log('=============================\n');

  try {
    // Parse sitemap to get URLs
    console.log('📄 Parsing sitemap...');
    const urls = await parseSitemap();
    console.log(`✅ Found ${urls.length} URLs for ${PRIMARY_HOST}\n`);

    // Display URLs to be submitted
    console.log('📋 URLs to submit:');
    urls.forEach(url => console.log(`  - ${url}`));
    console.log('');

    // Submit to each IndexNow endpoint
    console.log('🔄 Submitting to IndexNow endpoints...\n');
    
    for (const endpoint of INDEXNOW_ENDPOINTS) {
      console.log(`Submitting to ${endpoint}...`);
      const result = await submitToIndexNow(urls, endpoint);
      
      if (result.ok) {
        console.log(`✅ Success! Status: ${result.status} ${result.statusText}`);
      } else if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      } else {
        console.log(`⚠️  Response: ${result.status} ${result.statusText}`);
      }
      console.log('');
    }

    // Summary
    console.log('=============================');
    console.log('📊 Submission Summary:');
    console.log(`- Total URLs submitted: ${urls.length}`);
    console.log(`- Key file: https://${PRIMARY_HOST}/${INDEXNOW_KEY}.txt`);
    console.log(`- Host: ${PRIMARY_HOST}`);
    console.log('\n✨ IndexNow submission complete!');
    
    // Provide next steps
    console.log('\n📌 Next Steps:');
    console.log('1. The key verification file has been created at: public/' + INDEXNOW_KEY + '.txt');
    console.log('2. Deploy your changes to make the key file accessible');
    console.log('3. Search engines will verify the key and start processing your URLs');
    console.log('4. You can rerun this script anytime to submit updated URLs');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if fast-xml-parser is installed
try {
  require('fast-xml-parser');
} catch (error) {
  console.log('📦 Installing required dependency: fast-xml-parser');
  const { execSync } = require('child_process');
  execSync('npm install fast-xml-parser', { stdio: 'inherit' });
  console.log('✅ Dependency installed. Please run the script again.');
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main();
}