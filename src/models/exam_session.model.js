const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamSession = sequelize.define('ExamSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificate_type_id: {
    type: DataTypes.UUID,
    references: {
      model: 'certificate_types',
      key: 'id'
    }
  },
  exam_date: DataTypes.DATE,
  room: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'upcoming'
  },
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'exam_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ExamSession; 