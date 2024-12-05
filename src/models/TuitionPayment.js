const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TuitionPayment = sequelize.define('TuitionPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  enrollmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Enrollments',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed'
  },
  confirmedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  notes: DataTypes.TEXT
}, {
  timestamps: true,
  createdAt: 'payment_date'
});

module.exports = TuitionPayment; 