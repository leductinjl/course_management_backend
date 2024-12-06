const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CertificateType = sequelize.define('CertificateType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  requirements: DataTypes.TEXT,
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'certificate_types',
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = CertificateType; 