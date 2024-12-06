const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamSession = sequelize.define('ExamSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificateTypeId: {
    type: DataTypes.UUID,
    references: {
      model: 'CertificateTypes',
      key: 'id'
    }
  },
  examDate: DataTypes.DATE,
  room: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
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
  tableName: 'exam_sessions',
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = ExamSession; 