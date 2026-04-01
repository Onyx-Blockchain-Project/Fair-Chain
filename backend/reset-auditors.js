const { Auditor } = require('./src/models');

async function resetAuditors() {
  try {
    console.log('WARNING: This will delete ALL auditor records!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const count = await Auditor.count();
    console.log(`Deleting ${count} auditor records...`);
    
    await Auditor.destroy({
      where: {},
      truncate: true
    });
    
    console.log('All auditor records deleted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAuditors();
