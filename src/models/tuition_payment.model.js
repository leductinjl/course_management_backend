const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TuitionPayment = sequelize.define('TuitionPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tuition_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tuitions',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['bank_transfer', 'cash', 'e_wallet', 'credit_card', 'vnpay']]
    }
  },
  payment_details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_transaction_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'completed', 'failed', 'refunded']]
    }
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'tuition_payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TuitionPayment; 