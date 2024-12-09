const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Instructor = require('./Instructor');

const InstructorCertificate = sequelize.define('InstructorCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  instructorId: {
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
  issueYear: {
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
InstructorCertificate.belongsTo(Instructor, { foreignKey: 'instructorId' });
Instructor.hasMany(InstructorCertificate, { foreignKey: 'instructorId' });

module.exports = InstructorCertificate;