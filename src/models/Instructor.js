const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instructor = sequelize.define('Instructor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  specialization: DataTypes.TEXT,
  bio: DataTypes.TEXT,
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  updatedBy: {
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