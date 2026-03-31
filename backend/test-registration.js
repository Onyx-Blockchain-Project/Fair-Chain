const axios = require('axios');

async function testRegistration() {
  try {
    const testData = {
      owner: 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H',
      walletAddress: 'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H',
      name: 'Test Factory Updated',
      location: 'Addis Ababa',
      productType: 'coffee',
      employeeCount: 50,
      latitude: 9.1450,
      longitude: 38.7617,
    };

    console.log('Testing factory registration...');
    const response = await axios.post('http://localhost:3001/api/factories/register', testData);
    
    console.log('✅ Success:', response.data);
    console.log('Message:', response.data.message);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRegistration();
