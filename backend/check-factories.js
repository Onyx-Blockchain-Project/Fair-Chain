const { Factory } = require('./src/models');
require('dotenv').config();

async function checkFactories() {
  try {
    const factories = await Factory.findAll();
    console.log('Existing factories:');
    factories.forEach(f => console.log(`- ${f.name}: ${f.wallet_address}`));
    
    if (factories.length === 0) {
      console.log('No factories found in database.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFactories();
