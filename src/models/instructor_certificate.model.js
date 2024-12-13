const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Instructor = require('./instructor.model');

const InstructorCertificate = sequelize.define('InstructorCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issue_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'instructor_certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define the association here
InstructorCertificate.belongsTo(Instructor, { foreignKey: 'instructor_id' });
Instructor.hasMany(InstructorCertificate, { foreignKey: 'instructor_id' });

module.exports = InstructorCertificate;