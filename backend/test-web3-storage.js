// Try Web3.Storage as an alternative
const { Web3Storage } = require('web3.storage');

const apiKey = '48dad865.6de310309ecc4037805bf5ac30630b0d';

console.log('Testing Web3.Storage...');
console.log('API Key:', apiKey);

try {
  const client = new Web3Storage({ token: apiKey });
  console.log('✅ Web3.Storage client initialized');
  
  const files = [
    new File(['Hello, FairChain! Web3.Storage test'], 'fairchain-test.txt', {
      type: 'text/plain',
    })
  ];
  
  client.put(files).then(cid => {
    console.log('✅ Upload successful!');
    console.log('🔑 CID:', cid);
    console.log('🌐 URL:', `https://ipfs.io/ipfs/${cid}/fairchain-test.txt`);
    console.log('🎉 Web3.Storage is working!');
  }).catch(error => {
    console.error('❌ Web3.Storage failed:', error.message);
    
    // Try without Web3.Storage - maybe use a different approach
    console.log('\n🔍 Trying alternative approach...');
    console.log('📝 The API key format might be for a different service');
    console.log('🔍 Let me check if we can use Pinata or another service');
  });
  
} catch (error) {
  console.error('❌ Web3.Storage initialization failed:', error.message);
}
