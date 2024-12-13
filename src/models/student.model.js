const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
  date_of_birth: DataTypes.DATE,
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
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Student; 