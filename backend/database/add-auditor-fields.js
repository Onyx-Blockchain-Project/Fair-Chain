const sequelize = require('../src/config/database');

async function migrateAuditorFields() {
  try {
    console.log('Adding name and email fields to auditors table...');

    await sequelize.authenticate();
    console.log('Database connection established.');

    // Add name and email columns to auditors table
    await sequelize.getQueryInterface().addColumn('auditors', 'name', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('auditors', 'email', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
    });

    console.log('Successfully added name and email fields to auditors table.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAuditorFields();
