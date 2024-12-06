const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  instructorId: {
    type: DataTypes.UUID,
    references: {
      model: 'Instructors',
      key: 'id'
    }
  },
  classCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  schedule: DataTypes.TEXT,
  room: DataTypes.STRING,
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'upcoming'
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'classes',
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = Class; 