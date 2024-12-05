const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseRequest = sequelize.define('CourseRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructorId: {
    type: DataTypes.UUID,
    references: {
      model: 'Instructors',
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
  desiredStartDate: DataTypes.DATE,
  desiredSchedule: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  adminNotes: DataTypes.TEXT
}, {
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = CourseRequest; 