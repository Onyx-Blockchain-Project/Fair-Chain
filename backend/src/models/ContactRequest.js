const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactRequest = sequelize.define('ContactRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  buyer_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  factory_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RESPONDED', 'CLOSED'),
    defaultValue: 'PENDING',
  },
  buyer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'contact_requests',
  timestamps: true,
  indexes: [
    { fields: ['buyer_address'] },
    { fields: ['factory_address'] },
    { fields: ['status'] },
  ],
});

module.exports = ContactRequest;
