const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseRequest = sequelize.define('CourseRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  desired_start_date: DataTypes.DATE,
  desired_schedule: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  admin_notes: DataTypes.TEXT
}, {
  tableName: 'course_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CourseRequest; 