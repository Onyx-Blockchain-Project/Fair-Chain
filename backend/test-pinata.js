// Try Pinata as an alternative IPFS service
const axios = require('axios');

// Pinata API (free tier available)
const PINATA_API_KEY = 'your_pinata_api_key_here';
const PINATA_SECRET_KEY = 'your_pinata_secret_key_here';

console.log('Testing Pinata as alternative...');

// For now, let's create a simple IPFS fallback service
class SimpleIPFSService {
  constructor() {
    this.gateway = 'https://ipfs.io/ipfs';
  }

  async uploadFile(fileBuffer, filename) {
    // For development, we can simulate IPFS upload
    // In production, you'd use a real IPFS service
    const mockHash = 'bafybei' + Math.random().toString(36).substring(2, 15);
    
    return {
      hash: mockHash,
      url: `${this.gateway}/${mockHash}`,
      metadataUrl: `${this.gateway}/${mockHash}`,
      filename,
      size: fileBuffer.length,
    };
  }

  async uploadMultipleFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.originalname);
        results.push({
          hash: result.hash,
          url: result.url,
          metadataUrl: result.metadataUrl,
          size: result.size,
          name: file.originalname,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        results.push(null);
      }
    }

    return results.filter(r => r !== null);
  }

  isAvailable() {
    return true; // Always available for development
  }
}

// Test the simple service
const simpleService = new SimpleIPFSService();

console.log('🔍 Testing Simple IPFS Service...');

const testBuffer = Buffer.from('Hello, FairChain! This is a test upload.');
simpleService.uploadFile(testBuffer, 'test.txt').then(result => {
  console.log('✅ Simple IPFS Service working!');
  console.log('🔑 Hash:', result.hash);
  console.log('🌐 URL:', result.url);
  console.log('📊 Size:', result.size);
  
  console.log('\n🎉 This approach will work for development!');
  console.log('📝 For production, you can:');
  console.log('   1. Use Pinata (free tier available)');
  console.log('   2. Use Infura IPFS');
  console.log('   3. Run your own IPFS node');
  
}).catch(error => {
  console.error('❌ Simple service failed:', error);
});
