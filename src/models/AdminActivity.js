const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminActivity = sequelize.define('AdminActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  activityType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  affectedTable: DataTypes.STRING,
  affectedId: DataTypes.UUID
}, {
  tableName: 'admin_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AdminActivity; 