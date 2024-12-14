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
  attendance_score: {
    type: DataTypes.DECIMAL(4, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  midterm_score: {
    type: DataTypes.DECIMAL(4, 2),
    validate: {
      min: 0,
      max: 10
    }
  },
  final_score: {
    type: DataTypes.DECIMAL(4, 2),
    validate: {
      min: 0,
      max: 10
    }
  },
  total_score: {
    type: DataTypes.DECIMAL(4, 2),
    validate: {
      min: 0,
      max: 10
    }
  },
  grade_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'graded', 'verified']]
    }
  },
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
  },
  verified_at: DataTypes.DATE
}, {
  tableName: 'grades',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: 'created_at'
});

module.exports = Grade; 