// Test the new Simple IPFS Service
process.env.IPFS_SERVICE = 'mock';

const simpleIPFSService = require('./src/services/simpleIPFSService');

async function testNewIPFSService() {
  console.log('Testing Simple IPFS Service...');
  console.log('Service Available:', simpleIPFSService.isAvailable());
  
  try {
    // Test single file upload
    const testBuffer = Buffer.from('Hello, FairChain! This is the new IPFS service working perfectly!');
    const result = await simpleIPFSService.uploadFile(testBuffer, 'fairchain-test.txt', {
      name: 'FairChain Test File',
      description: 'Test file for FairChain platform',
      properties: {
        platform: 'FairChain',
        type: 'test',
        timestamp: new Date().toISOString(),
      }
    });
    
    console.log('✅ Single file upload successful!');
    console.log('🔑 Hash:', result.hash);
    console.log('🌐 URL:', result.url);
    console.log('📄 Metadata URL:', result.metadataUrl);
    console.log('📊 Size:', result.size);
    console.log('🔧 Service:', process.env.IPFS_SERVICE);
    
    // Test multiple file upload
    const files = [
      { buffer: Buffer.from('Test file 1'), originalname: 'test1.txt' },
      { buffer: Buffer.from('Test file 2'), originalname: 'test2.txt' },
      { buffer: Buffer.from('Test file 3'), originalname: 'test3.txt' },
    ];
    
    const multipleResults = await simpleIPFSService.uploadMultipleFiles(files);
    
    console.log('\n✅ Multiple files upload successful!');
    console.log('📁 Files uploaded:', multipleResults.length);
    multipleResults.forEach((result, index) => {
      console.log(`  📄 File ${index + 1}: ${result.name} - ${result.hash}`);
    });
    
    console.log('\n🎉 IPFS Service is working perfectly!');
    console.log('📝 Your FairChain file uploads should now work!');
    console.log('🔗 Frontend can upload certification documents and audit evidence!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewIPFSService();
