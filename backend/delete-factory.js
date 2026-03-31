const { Factory } = require('./src/models');
require('dotenv').config();

async function deleteFactory(walletAddress) {
  try {
    const result = await Factory.destroy({
      where: { wallet_address: walletAddress }
    });
    
    if (result > 0) {
      console.log(`Successfully deleted factory with wallet: ${walletAddress}`);
    } else {
      console.log(`No factory found with wallet: ${walletAddress}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Delete the factory that's causing the issue
deleteFactory('GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H');
