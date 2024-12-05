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
      model: 'Enrollments',
      key: 'id'
    }
  },
  midtermGrade: DataTypes.DECIMAL(4, 2),
  finalGrade: DataTypes.DECIMAL(4, 2),
  lastUpdatedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Instructors',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  updatedAt: 'updated_at'
});

module.exports = Grade; 