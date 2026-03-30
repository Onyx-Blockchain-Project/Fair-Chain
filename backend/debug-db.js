const { Factory, ReputationScore } = require('./src/models');

async function debugDatabase() {
  console.log('=== DEBUG DATABASE ===\n');
  
  try {
    // Count factories
    const factoryCount = await Factory.count();
    console.log(`Factory count: ${factoryCount}`);
    
    // Get all factories
    const factories = await Factory.findAll({ limit: 5 });
    console.log('\nFactories:');
    factories.forEach(f => {
      console.log(`  - ${f.name} (${f.location}) - Active: ${f.is_active}`);
    });
    
    // Count reputation scores
    const scoreCount = await ReputationScore.count();
    console.log(`\nReputationScore count: ${scoreCount}`);
    
    // Get all scores
    const scores = await ReputationScore.findAll({ limit: 5 });
    console.log('\nReputation Scores:');
    scores.forEach(s => {
      console.log(`  - ${s.factory_address}: ${s.total_score}`);
    });
    
    console.log('\n=== END DEBUG ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugDatabase();
