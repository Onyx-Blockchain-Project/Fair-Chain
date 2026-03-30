const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Factory = sequelize.define('Factory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  owner_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employee_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  profile_nft_token_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  blockchain_tx_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'factories',
  timestamps: true,
  indexes: [
    { fields: ['wallet_address'] },
    { fields: ['location'] },
    { fields: ['product_type'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Factory;
