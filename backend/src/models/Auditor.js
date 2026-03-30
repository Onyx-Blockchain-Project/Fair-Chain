const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditor = sequelize.define('Auditor', {
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
  stake_amount: {
    type: DataTypes.DECIMAL(20, 7),
    allowNull: false,
  },
  geo_region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reputation_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  audit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  staked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  last_audit_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  slash_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'auditors',
  timestamps: true,
  indexes: [
    { fields: ['wallet_address'] },
    { fields: ['geo_region'] },
    { fields: ['is_active'] },
    { fields: ['reputation_score'] },
  ],
});

module.exports = Auditor;
