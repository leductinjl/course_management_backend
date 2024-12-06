const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  certificateTypeId: {
    type: DataTypes.UUID,
    references: {
      model: 'CertificateTypes',
      key: 'id'
    }
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  certificateNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  issuedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'certificates',
  timestamps: true
});

module.exports = Certificate; 