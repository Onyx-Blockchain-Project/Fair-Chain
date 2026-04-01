const nftStorageService = require('./src/services/nftStorageService');

async function testNFTStorage() {
  console.log('Testing NFT.Storage service...');
  
  // Check if NFT.Storage is available
  console.log('NFT.Storage Available:', nftStorageService.isAvailable());
  
  if (!nftStorageService.isAvailable()) {
    console.log('NFT.Storage service is not available. Please check your NFT_STORAGE_API_KEY environment variable.');
    console.log('Get your API key from: https://nft.storage/');
    return;
  }
  
  try {
    // Test upload
    const testBuffer = Buffer.from('Hello, FairChain NFT.Storage Test!');
    const result = await nftStorageService.uploadFile(testBuffer, 'test.txt', {
      name: 'FairChain Test File',
      description: 'Test file for FairChain platform',
      properties: {
        platform: 'FairChain',
        type: 'test',
        timestamp: new Date().toISOString(),
      }
    });
    
    console.log('Upload successful:');
    console.log('Hash:', result.hash);
    console.log('URL:', result.url);
    console.log('Metadata URL:', result.metadataUrl);
    console.log('Size:', result.size);
    
  } catch (error) {
    console.error('NFT.Storage test failed:', error.message);
  }
}

testNFTStorage();
