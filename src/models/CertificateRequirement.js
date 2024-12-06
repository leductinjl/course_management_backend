const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CertificateRequirement = sequelize.define('CertificateRequirement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificateTypeId: {
    type: DataTypes.UUID,
    references: {
      model: 'certificate_types',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  minimumGrade: DataTypes.DECIMAL(4, 2),
  createdBy: {
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