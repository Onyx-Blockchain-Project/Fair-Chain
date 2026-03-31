// Test Freighter detection
// Open browser console and run: testFreighter()

window.testFreighter = function() {
  console.log('=== Freighter Detection Test ===');
  
  // Check for Freighter
  if (window.freighter) {
    console.log('✅ window.freighter found');
    console.log('Methods:', Object.keys(window.freighter));
  } else {
    console.log('❌ window.freighter NOT found');
  }
  
  // Check for Stellar API
  if (window.stellar) {
    console.log('✅ window.stellar found');
    console.log('Methods:', Object.keys(window.stellar));
  } else {
    console.log('❌ window.stellar NOT found');
  }
  
  // Check for isConnected
  if (window.freighter?.isConnected) {
    window.freighter.isConnected().then(connected => {
      console.log('isConnected:', connected);
    });
  }
  
  // Try to get public key
  if (window.freighter?.getPublicKey) {
    window.freighter.getPublicKey()
      .then(key => console.log('✅ Got public key:', key))
      .catch(err => console.log('❌ getPublicKey error:', err.message));
  }
  
  console.log('=================================');
};

// Run automatically
setTimeout(window.testFreighter, 2000);
