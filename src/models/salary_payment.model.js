const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryPayment = sequelize.define('SalaryPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  class_id: {
    type: DataTypes.UUID,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  confirmed_by_instructor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmed_at: DataTypes.DATE,
  processed_by: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  notes: DataTypes.TEXT
}, {
  tableName: 'salary_payments',
  timestamps: true,
  createdAt: 'payment_date',
  updatedAt: 'updated_at'
});

module.exports = SalaryPayment; 