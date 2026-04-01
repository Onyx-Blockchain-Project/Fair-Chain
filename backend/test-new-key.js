// Test the new API key
process.env.NFT_STORAGE_API_KEY = '48dad865.6de310309ecc4037805bf5ac30630b0d';

const { NFTStorage } = require('nft.storage');

console.log('Testing new API key...');
console.log('API Key:', process.env.NFT_STORAGE_API_KEY);

// Check JWT format
const parts = process.env.NFT_STORAGE_API_KEY.split('.');
console.log('JWT Parts:', parts.length, '(should be 3)');

try {
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
  console.log('✅ NFT.Storage client initialized successfully');
  
  // Test a simple blob upload
  const testBlob = new Blob(['Hello, FairChain! NFT.Storage is working!'], { type: 'text/plain' });
  
  client.storeBlob(testBlob).then(cid => {
    console.log('✅ Upload successful!');
    console.log('🔑 CID:', cid);
    console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}`);
    console.log('🎉 NFT.Storage is working perfectly!');
    console.log('📝 Your file uploads should now work!');
  }).catch(error => {
    console.error('❌ Upload failed:', error.message);
  });
  
} catch (error) {
  console.error('❌ Client initialization failed:', error.message);
}
