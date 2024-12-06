const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamRegistration = sequelize.define('ExamRegistration', {
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
  examSessionId: {
    type: DataTypes.UUID,
    references: {
      model: 'exam_sessions',
      key: 'id'
    }
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