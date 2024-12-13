const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'enrolled',
    validate: {
      isIn: [['enrolled', 'completed', 'cancelled']]
    }
  },
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  cancelled_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  createdAt: 'created_at',  
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'class_id']
    }
  ]
});

module.exports = Enrollment; 