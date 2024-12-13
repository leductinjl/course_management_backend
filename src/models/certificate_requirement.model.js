const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CertificateRequirement = sequelize.define('CertificateRequirement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificate_type_id: {
    type: DataTypes.UUID,
    references: {
      model: 'certificate_types',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  minimum_grade: DataTypes.DECIMAL(4, 2),
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'certificate_requirements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = CertificateRequirement; 