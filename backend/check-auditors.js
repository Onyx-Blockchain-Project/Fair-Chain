const { Auditor } = require('./src/models');

async function checkAuditors() {
  try {
    const auditors = await Auditor.findAll();
    console.log('Existing auditors:', auditors.length);
    auditors.forEach(a => {
      console.log(`- ${a.wallet_address} (name: ${a.name || 'NULL'}, email: ${a.email || 'NULL'})`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAuditors();
