const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Course; 