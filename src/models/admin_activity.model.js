const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminActivity = sequelize.define('AdminActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  admin_id: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  activity_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  affected_table: DataTypes.STRING,
  affected_id: DataTypes.UUID
}, {
  tableName: 'admin_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AdminActivity; 