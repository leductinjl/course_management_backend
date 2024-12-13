const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamRegistration = sequelize.define('ExamRegistration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  exam_session_id: {
    type: DataTypes.UUID,
    references: {
      model: 'exam_sessions',
      key: 'id'
    }
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'registered'
  }
}, {
  tableName: 'exam_registrations',
  timestamps: true,
  createdAt: 'registration_date',
  updatedAt: 'updated_at',
  freezeTableName: true
});

module.exports = ExamRegistration; 