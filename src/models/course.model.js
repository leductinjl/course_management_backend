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
    allowNull: false,
    validate: {
      min: 1
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['basic', 'advanced', 'specialized']]
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['draft', 'active', 'suspended', 'discontinued']]
    }
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
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
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Course; 