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
      model: 'Students',
      key: 'id'
    }
  },
  examSessionId: {
    type: DataTypes.UUID,
    references: {
      model: 'ExamSessions',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'registered'
  }
}, {
  timestamps: true,
  createdAt: 'registration_date'
});

module.exports = ExamRegistration; 