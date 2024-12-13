const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstructorAchievement = sequelize.define('InstructorAchievement', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  achievement_date: DataTypes.DATE
}, {
  tableName: 'instructor_achievements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}); 

module.exports = InstructorAchievement; 