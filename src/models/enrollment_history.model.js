const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnrollmentHistory = sequelize.define('EnrollmentHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
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
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['enrolled', 'cancelled']]
    }
  },
  action_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'enrollment_histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['enrollment_id']
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['class_id']
    }
  ]
});

module.exports = EnrollmentHistory;