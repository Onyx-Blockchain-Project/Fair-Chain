const ipfsService = require('./src/services/ipfsService');

async function testIPFS() {
  console.log('Testing IPFS service...');
  
  // Check if IPFS is available
  console.log('IPFS Available:', ipfsService.isAvailable());
  
  if (!ipfsService.isAvailable()) {
    console.log('IPFS service is not available. Please check your configuration.');
    return;
  }
  
  try {
    // Test upload
    const testBuffer = Buffer.from('Hello, FairChain IPFS Test!');
    const result = await ipfsService.uploadFile(testBuffer, 'test.txt');
    
    console.log('Upload successful:');
    console.log('Hash:', result.hash);
    console.log('URL:', result.url);
    console.log('Size:', result.size);
    
  } catch (error) {
    console.error('IPFS test failed:', error.message);
  }
}

testIPFS();
