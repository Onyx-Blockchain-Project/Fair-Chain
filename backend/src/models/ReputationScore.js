const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReputationScore = sequelize.define('ReputationScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  factory_address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  auditor_reputation_component: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  evidence_depth_component: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recency_component: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category_coverage_component: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  audit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_audit_timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  calculated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_compliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'reputation_scores',
  timestamps: true,
  indexes: [
    { fields: ['factory_address'] },
    { fields: ['total_score'] },
    { fields: ['is_compliant'] },
  ],
});

module.exports = ReputationScore;
