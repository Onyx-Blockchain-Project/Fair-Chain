// Debug NFT.Storage package and try different approaches
const nftStorage = require('nft.storage');

console.log('NFT.Storage package info:');
console.log('Available exports:', Object.keys(nftStorage));
console.log('NFTStorage constructor:', nftStorage.NFTStorage);
console.log('Version info:', nftStorage);

// Try different key formats
const keys = [
  '48dad865.6de310309ecc4037805bf5ac30630b0d',  // Your new key
  '2ace9ed4.c0ae0bc3ddaf428d87aaa5ae5036a5cc',  // Your old key
];

keys.forEach((key, index) => {
  console.log(`\n🔍 Testing key ${index + 1}:`, key);
  console.log('Parts:', key.split('.').length);
  console.log('Length:', key.length);
  
  try {
    const client = new nftStorage.NFTStorage({ token: key });
    console.log('✅ Client initialized');
    
    // Try a very simple upload
    const testContent = 'Test content for key ' + (index + 1);
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    client.storeBlob(blob).then(cid => {
      console.log('✅ SUCCESS! CID:', cid);
      console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}`);
    }).catch(error => {
      console.log('❌ Upload failed:', error.message);
    });
    
  } catch (error) {
    console.log('❌ Client failed:', error.message);
  }
});

// Also try to see if there's a different way to initialize
console.log('\n🔍 Checking for alternative initialization methods...');
try {
  // Maybe it expects just the key without object wrapper
  const client = new nftStorage.NFTStorage('48dad865.6de310309ecc4037805bf5ac30630b0d');
  console.log('✅ Alternative initialization worked!');
} catch (error) {
  console.log('❌ Alternative failed:', error.message);
}
