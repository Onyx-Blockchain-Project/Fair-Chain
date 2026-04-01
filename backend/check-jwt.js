// Check if the API key is a valid JWT format
const apiKey = '2ace9ed4.c0ae0bc3ddaf428d87aaa5ae5036a5cc';

console.log('Checking JWT format...');
console.log('API Key:', apiKey);

// Split the JWT into parts
const parts = apiKey.split('.');
console.log('Parts count:', parts.length);

if (parts.length === 3) {
  console.log('✅ Has 3 parts (header.payload.signature)');
  
  try {
    // Decode header
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    console.log('Header:', header);
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('Payload:', payload);
    
    console.log('✅ JWT format appears valid');
  } catch (error) {
    console.error('❌ JWT decode failed:', error.message);
  }
} else {
  console.log('❌ Invalid JWT format - should have 3 parts');
}

// Check if it might be an old format key
console.log('\nChecking other formats...');
console.log('Contains dots:', apiKey.includes('.'));
console.log('Length check:', apiKey.length, 'characters');
console.log('Characters:', apiKey.substring(0, 20), '...');

// Try to see if it's missing the signature part
if (parts.length === 2) {
  console.log('⚠️  Might be missing signature part');
}
