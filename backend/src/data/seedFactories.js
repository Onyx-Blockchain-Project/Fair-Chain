const { Factory, ReputationScore } = require('../models');
const sampleFactories = require('./sampleFactories');

async function seedFactories() {
  console.log('Seeding sample factories...');
  
  try {
    for (const factoryData of sampleFactories) {
      const [factory, created] = await Factory.findOrCreate({
        where: { wallet_address: factoryData.wallet_address },
        defaults: factoryData
      });
      
      if (created) {
        // Create initial reputation score
        await ReputationScore.create({
          factory_address: factory.wallet_address,
          total_score: Math.floor(Math.random() * 30) + 70,
          auditor_reputation_component: Math.floor(Math.random() * 20) + 80,
          evidence_depth_component: Math.floor(Math.random() * 25) + 75,
          recency_component: Math.floor(Math.random() * 20) + 80,
          category_coverage_component: Math.floor(Math.random() * 20) + 80,
          audit_count: Math.floor(Math.random() * 5) + 1,
          is_compliant: Math.random() > 0.3
        });
        console.log(`Created factory: ${factory.name}`);
      } else {
        console.log(`Factory already exists: ${factory.name}`);
      }
    }
    
    console.log('Factory seeding completed!');
  } catch (error) {
    console.error('Error seeding factories:', error);
  }
}

module.exports = seedFactories;

// Run if called directly
if (require.main === module) {
  seedFactories();
}
