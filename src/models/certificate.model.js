const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  certificate_type_id: {
    type: DataTypes.UUID,
    references: {
      model: 'certificate_types',
      key: 'id'
    }
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  certificate_number: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  issued_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Certificate; 