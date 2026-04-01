const { Auditor } = require('./src/models');

async function cleanupAuditors() {
  try {
    console.log('Cleaning up invalid auditor records...');
    
    // Remove auditor with empty wallet address
    await Auditor.destroy({
      where: {
        wallet_address: ''
      }
    });
    console.log('Removed auditor with empty wallet address');

    // Show remaining auditors
    const auditors = await Auditor.findAll();
    console.log('Remaining auditors:', auditors.length);
    auditors.forEach(a => {
      console.log(`- ${a.wallet_address} (name: ${a.name || 'NULL'}, email: ${a.email || 'NULL'})`);
    });

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupAuditors();
