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
      model: 'Users',
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
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = Instructor; 