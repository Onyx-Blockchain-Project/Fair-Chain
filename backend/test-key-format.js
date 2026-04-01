// Test different API key formats
const { NFTStorage } = require('nft.storage');

const apiKey = '2ace9ed4.c0ae0bc3ddaf428d87aaa5ae5036a5cc';

console.log('Testing API key format...');
console.log('API Key:', apiKey);
console.log('Length:', apiKey.length);
console.log('Format check:', apiKey.includes('.'));

try {
  const client = new NFTStorage({ token: apiKey });
  console.log('✅ NFT.Storage client initialized successfully');
  
  // Test a simple blob upload
  const testBlob = new Blob(['Hello, FairChain!'], { type: 'text/plain' });
  
  client.storeBlob(testBlob).then(cid => {
    console.log('✅ Upload successful!');
    console.log('🔑 CID:', cid);
    console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}`);
    console.log('🎉 NFT.Storage is working perfectly!');
  }).catch(error => {
    console.error('❌ Upload failed:', error.message);
    console.error('Full error:', error);
  });
  
} catch (error) {
  console.error('❌ Client initialization failed:', error.message);
  console.error('Full error:', error);
}
