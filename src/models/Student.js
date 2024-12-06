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
  dateOfBirth: DataTypes.DATE,
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
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Student; 