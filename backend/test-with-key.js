// Set the API key directly for testing
process.env.NFT_STORAGE_API_KEY = '2ace9ed4.c0ae0bc3ddaf428d87aaa5ae5036a5cc';

const nftStorageService = require('./src/services/nftStorageService');

async function testNFTStorage() {
  console.log('Testing NFT.Storage with your API key...');
  
  // Check if NFT.Storage is available
  console.log('NFT.Storage Available:', nftStorageService.isAvailable());
  
  if (!nftStorageService.isAvailable()) {
    console.log('❌ NFT.Storage service is not available');
    return;
  }
  
  try {
    // Test upload
    const testBuffer = Buffer.from('Hello, FairChain NFT.Storage Test! This is working perfectly.');
    const result = await nftStorageService.uploadFile(testBuffer, 'fairchain-test.txt', {
      name: 'FairChain Test File',
      description: 'Test file for FairChain platform - certification upload test',
      properties: {
        platform: 'FairChain',
        type: 'test',
        timestamp: new Date().toISOString(),
      }
    });
    
    console.log('✅ Upload successful!');
    console.log('🔑 Hash:', result.hash);
    console.log('🌐 URL:', result.url);
    console.log('📄 Metadata URL:', result.metadataUrl);
    console.log('📊 Size:', result.size, 'bytes');
    
    console.log('\n🎉 Your NFT.Storage integration is working!');
    console.log('📝 You can now upload certification documents and audit evidence.');
    
  } catch (error) {
    console.error('❌ NFT.Storage test failed:', error.message);
  }
}

testNFTStorage();
