const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  factory_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  auditor_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  compliance_category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score_delta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ipfs_hashes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
    defaultValue: [],
  },
  geolocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  dispute_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  blockchain_tx_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'audits',
  timestamps: true,
  indexes: [
    { fields: ['token_id'] },
    { fields: ['factory_address'] },
    { fields: ['auditor_address'] },
    { fields: ['compliance_category'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Audit;
