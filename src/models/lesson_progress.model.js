const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  lesson_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completion_date: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  }
}, {
  tableName: 'lesson_progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LessonProgress; 