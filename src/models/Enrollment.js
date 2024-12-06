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
      model: 'Students',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.UUID,
    references: {
      model: 'Classes',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  createdAt: 'enrollment_date'
});

module.exports = Enrollment; 