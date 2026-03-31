const { Factory } = require('./src/models');
require('dotenv').config();

async function showFullWallets() {
  try {
    const factories = await Factory.findAll();
    console.log('=== FACTORY WALLET ADDRESSES ===\n');
    
    factories.forEach((factory, index) => {
      console.log(`${index + 1}. Factory Name: ${factory.name}`);
      console.log(`   Wallet Address: ${factory.wallet_address}`);
      console.log(`   Owner Address: ${factory.owner_address}`);
      console.log(`   Location: ${factory.location}`);
      console.log(`   Product Type: ${factory.product_type}`);
      console.log(`   Employees: ${factory.employee_count}`);
      console.log('---');
    });
    
    console.log(`\nTotal factories: ${factories.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

showFullWallets();
