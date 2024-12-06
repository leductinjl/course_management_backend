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
      model: 'instructors',
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
  desiredStartDate: DataTypes.DATE,
  desiredSchedule: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  adminNotes: DataTypes.TEXT
}, {
  tableName: 'course_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CourseRequest; 