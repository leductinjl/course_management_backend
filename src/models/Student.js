const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
  dateOfBirth: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {  
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at'
});

module.exports = Student; 