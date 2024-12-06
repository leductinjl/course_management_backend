const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adminType: {
    type: DataTypes.ENUM('course_admin', 'user_admin', 'finance_admin'),
    allowNull: false
  },
  phone: DataTypes.STRING,
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Admin; 