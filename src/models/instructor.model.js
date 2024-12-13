const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instructor = sequelize.define('Instructor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  specialization: DataTypes.TEXT,
  bio: DataTypes.TEXT,
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'instructors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Instructor; 