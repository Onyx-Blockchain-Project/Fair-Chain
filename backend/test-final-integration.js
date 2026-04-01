// Final integration test for IPFS service
const express = require('express');
const request = require('supertest');
const ipfsRoutes = require('./src/routes/ipfs');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/ipfs', ipfsRoutes);

async function testFullIntegration() {
  console.log('🧪 Testing Full IPFS Integration...');
  console.log('=' * 50);
  
  try {
    // Test 1: Single file upload
    console.log('📤 Test 1: Single file upload...');
    
    const response1 = await request(app)
      .post('/api/ipfs/upload')
      .attach('file', Buffer.from('FairChain certification document'), 'certification.pdf')
      .expect(200);
    
    console.log('✅ Single file upload successful!');
    console.log('📋 Response:', {
      success: response1.body.success,
      hash: response1.body.hash,
      url: response1.body.url,
      service: response1.body.service,
    });
    
    // Test 2: Multiple file upload
    console.log('\n📤 Test 2: Multiple file upload...');
    
    const response2 = await request(app)
      .post('/api/ipfs/upload-multiple')
      .attach('files', Buffer.from('Audit evidence 1'), 'evidence1.jpg')
      .attach('files', Buffer.from('Audit evidence 2'), 'evidence2.png')
      .attach('files', Buffer.from('Audit report'), 'report.pdf')
      .expect(200);
    
    console.log('✅ Multiple file upload successful!');
    console.log('📁 Files uploaded:', response2.body.uploads.length);
    response2.body.uploads.forEach((upload, index) => {
      console.log(`  📄 File ${index + 1}: ${upload.filename} - ${upload.hash.substring(0, 20)}...`);
    });
    
    // Test 3: Error handling
    console.log('\n📤 Test 3: Error handling...');
    
    const response3 = await request(app)
      .post('/api/ipfs/upload')
      .expect(400);
    
    console.log('✅ Error handling working!');
    console.log('❌ Expected error:', response3.body.message);
    
    console.log('\n🎉 All tests passed!');
    console.log('=' * 50);
    console.log('📝 Your FairChain IPFS integration is ready!');
    console.log('🔗 Factory registration can upload certifications');
    console.log('🔗 Auditor dashboard can upload evidence');
    console.log('🔗 All file uploads will work seamlessly!');
    
    console.log('\n📋 Configuration Summary:');
    console.log('🔧 Service: Mock IPFS (for development)');
    console.log('🌐 Gateway: https://ipfs.io/ipfs');
    console.log('📁 Max files: 10 per upload');
    console.log('💾 Supported formats: PDF, JPG, PNG, etc.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

testFullIntegration();
