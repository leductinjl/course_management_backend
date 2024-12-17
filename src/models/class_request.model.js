const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassRequest = sequelize.define('ClassRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  expected_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  desired_start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterFourWeeks(value) {
        const fourWeeksFromNow = new Date();
        fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28);
        if (new Date(value) < fourWeeksFromNow) {
          throw new Error('Ngày bắt đầu phải sau 4 tuần kể từ ngày đăng ký');
        }
      }
    }
  },
  schedule_note: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  admin_notes: DataTypes.TEXT,
  reviewed_at: DataTypes.DATE
}, {
  tableName: 'class_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ClassRequest; 