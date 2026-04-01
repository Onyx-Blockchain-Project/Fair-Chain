const Factory = require('./Factory');
const Auditor = require('./Auditor');
const Audit = require('./Audit');
const ReputationScore = require('./ReputationScore');
const ContactRequest = require('./ContactRequest');

// Define associations
Factory.hasOne(ReputationScore, {
  foreignKey: 'factory_address',
  sourceKey: 'wallet_address',
  as: 'ReputationScore'
});

ReputationScore.belongsTo(Factory, {
  foreignKey: 'factory_address',
  targetKey: 'wallet_address'
});

Factory.hasMany(Audit, {
  foreignKey: 'factory_address',
  sourceKey: 'wallet_address'
});

Audit.belongsTo(Factory, {
  foreignKey: 'factory_address',
  targetKey: 'wallet_address'
});

Auditor.hasMany(Audit, {
  foreignKey: 'auditor_address',
  sourceKey: 'wallet_address'
});

Audit.belongsTo(Auditor, {
  foreignKey: 'auditor_address',
  targetKey: 'wallet_address'
});

module.exports = {
  Factory,
  Auditor,
  Audit,
  ReputationScore,
  ContactRequest,
};
