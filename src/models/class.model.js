const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  instructor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  class_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  schedule: DataTypes.TEXT,
  room: DataTypes.STRING,
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'upcoming',
    validate: {
      isIn: [['upcoming', 'ongoing', 'completed', 'cancelled']]
    }
  },
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'classes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Class; 