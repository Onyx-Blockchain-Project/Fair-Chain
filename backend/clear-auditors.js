const { Auditor } = require('./src/models');

async function clearAuditors() {
  try {
    console.log('Clearing all auditor records...');
    
    const count = await Auditor.count();
    console.log(`Found ${count} auditor records to delete...`);
    
    // Delete all records one by one to avoid foreign key constraints
    await Auditor.destroy({
      where: {}
    });
    
    console.log('All auditor records deleted successfully');
    
    // Verify deletion
    const remaining = await Auditor.count();
    console.log(`Remaining auditor records: ${remaining}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearAuditors();
