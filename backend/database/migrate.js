const sequelize = require('../src/config/database');

async function migrate() {
  try {
    console.log('Starting database migration...');

    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: process.argv.includes('--force') });
    console.log('Database tables synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
