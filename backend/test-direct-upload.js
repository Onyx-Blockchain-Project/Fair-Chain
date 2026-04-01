// Test direct upload with the new key format
const { NFTStorage } = require('nft.storage');
const apiKey = '48dad865.6de310309ecc4037805bf5ac30630b0d';

console.log('Testing direct NFT.Storage upload...');
console.log('API Key:', apiKey);

// Try different initialization methods
try {
  // Method 1: Direct token
  console.log('\n🔍 Method 1: Direct token');
  const client1 = new NFTStorage({ token: apiKey });
  
  const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
  
  client1.storeBlob(testBlob).then(cid => {
    console.log('✅ Method 1 successful! CID:', cid);
    console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}`);
  }).catch(error => {
    console.log('❌ Method 1 failed:', error.message);
    
    // Method 2: Try with authorization header
    console.log('\n🔍 Method 2: Authorization header');
    const client2 = new NFTStorage({
      token: apiKey,
      endpoint: new URL('https://api.nft.storage')
    });
    
    client2.storeBlob(testBlob).then(cid => {
      console.log('✅ Method 2 successful! CID:', cid);
      console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}`);
    }).catch(error2 => {
      console.log('❌ Method 2 failed:', error2.message);
      
      // Method 3: Check if it's a different format
      console.log('\n🔍 Method 3: Check key format details');
      console.log('Key length:', apiKey.length);
      console.log('Key parts:', apiKey.split('.').length);
      
      // Maybe it's not a JWT but a different format
      console.log('⚠️  This might be a different API key format');
      console.log('📝 Try checking NFT.Storage documentation for current API format');
    });
  });
  
} catch (error) {
  console.error('❌ Initialization failed:', error.message);
}
