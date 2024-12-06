const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.UUID,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  processedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  createdAt: 'enrollment_date',
  updatedAt: 'updated_at'
});

module.exports = Enrollment; 