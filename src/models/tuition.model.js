const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tuition = sequelize.define('Tuition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  enrollment_id: {
    type: DataTypes.UUID,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'processing'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'tuitions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Tuition; 