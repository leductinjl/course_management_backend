const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  midterm_grade: DataTypes.DECIMAL(4, 2),
  final_grade: DataTypes.DECIMAL(4, 2),
  last_updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  verified_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'grades',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: 'created_at'
});

module.exports = Grade; 