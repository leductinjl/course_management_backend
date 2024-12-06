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
      model: 'CertificateTypes',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.UUID,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  minimumGrade: DataTypes.DECIMAL(4, 2),
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'certificate_requirements',
  timestamps: true
});

module.exports = CertificateRequirement; 