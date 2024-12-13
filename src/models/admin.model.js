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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin_type: {
    type: DataTypes.ENUM('super_admin', 'course_admin', 'user_admin', 'finance_admin'),
    allowNull: false
  },
  phone: DataTypes.STRING,
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: DataTypes.DATE,
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