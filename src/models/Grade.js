const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  midtermGrade: DataTypes.DECIMAL(4, 2),
  finalGrade: DataTypes.DECIMAL(4, 2),
  lastUpdatedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'grades',
  timestamps: true,
  updatedAt: 'updated_at'
});

module.exports = Grade; 