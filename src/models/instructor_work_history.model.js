const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstructorWorkHistory = sequelize.define('InstructorWorkHistory', {
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
    },
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: DataTypes.DATE,
  responsibilities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  }
}, {
  tableName: 'instructor_work_histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InstructorWorkHistory;