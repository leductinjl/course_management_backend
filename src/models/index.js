const sequelize = require('../config/database');
const Admin = require('./Admin');
const AdminActivity = require('./AdminActivity');
const Certificate = require('./Certificate');
const CertificateRequirement = require('./CertificateRequirement');
const CertificateType = require('./CertificateType');
const Class = require('./Class');
const Course = require('./Course');
const CourseRequest = require('./CourseRequest');
const Enrollment = require('./Enrollment');
const ExamRegistration = require('./ExamRegistration');
const ExamSession = require('./ExamSession');
const Grade = require('./Grade');
const Instructor = require('./Instructor');
const SalaryPayment = require('./SalaryPayment');
const Student = require('./Student');
const TuitionPayment = require('./TuitionPayment');
const User = require('./User');

// User Relations
User.hasOne(Student, { 
  foreignKey: 'userId', 
  as: 'studentProfile',
  onDelete: 'CASCADE'
});
User.hasOne(Instructor, { 
  foreignKey: 'userId', 
  as: 'instructorProfile',
  onDelete: 'CASCADE'
});
Student.belongsTo(User, { foreignKey: 'userId' });
Instructor.belongsTo(User, { foreignKey: 'userId' });

// Admin Relations
Admin.hasMany(AdminActivity, { foreignKey: 'adminId' });
Admin.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });
Admin.hasMany(Course, { foreignKey: 'updatedBy', as: 'updatedCourses' });
Admin.hasMany(Class, { foreignKey: 'createdBy', as: 'createdClasses' });
Admin.hasMany(ExamSession, { foreignKey: 'createdBy', as: 'createdExamSessions' });
Admin.hasMany(CertificateType, { foreignKey: 'createdBy', as: 'createdCertificateTypes' });
Admin.hasMany(Certificate, { foreignKey: 'issuedBy', as: 'issuedCertificates' });
Admin.hasMany(CourseRequest, { foreignKey: 'reviewedBy', as: 'reviewedRequests' });

// Additional Admin Relations
AdminActivity.belongsTo(Admin, { foreignKey: 'adminId' });
Admin.hasMany(CertificateRequirement, { foreignKey: 'createdBy', as: 'createdRequirements' });
Admin.hasMany(TuitionPayment, { foreignKey: 'confirmedBy', as: 'confirmedTuitions' });
Admin.hasMany(SalaryPayment, { foreignKey: 'processedBy', as: 'processedSalaries' });
Admin.hasMany(Student, { foreignKey: 'createdBy', as: 'createdStudents' });
Admin.hasMany(Instructor, { foreignKey: 'createdBy', as: 'createdInstructors' });
Admin.hasMany(Enrollment, { foreignKey: 'processedBy', as: 'processedEnrollments' });
Admin.hasMany(Grade, { foreignKey: 'verifiedBy', as: 'verifiedGrades' });

// Course and Class Relations
Course.hasMany(Class, { foreignKey: 'courseId' });
Course.hasMany(CourseRequest, { foreignKey: 'courseId' });
Course.hasMany(CertificateRequirement, { foreignKey: 'courseId' });
Class.belongsTo(Course, { foreignKey: 'courseId' });
Class.belongsTo(Instructor, { foreignKey: 'instructorId' });
Class.hasMany(Enrollment, { foreignKey: 'classId' });

// Instructor Relations
Instructor.hasMany(Class, { foreignKey: 'instructorId' });
Instructor.hasMany(CourseRequest, { foreignKey: 'instructorId' });
Instructor.hasMany(SalaryPayment, { foreignKey: 'instructorId' });
Instructor.hasMany(Grade, { foreignKey: 'lastUpdatedBy', as: 'gradesUpdated' });

// Student Relations
Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Student.hasMany(ExamRegistration, { foreignKey: 'studentId' });
Student.hasMany(Certificate, { foreignKey: 'studentId' });
Student.hasMany(TuitionPayment, { foreignKey: 'studentId' });

// Certificate Relations
CertificateType.hasMany(Certificate, { foreignKey: 'certificateTypeId' });
CertificateType.hasMany(CertificateRequirement, { foreignKey: 'certificateTypeId' });
Certificate.belongsTo(CertificateType, { foreignKey: 'certificateTypeId' });

// Exam Relations
ExamSession.hasMany(ExamRegistration, { foreignKey: 'examSessionId' });
ExamRegistration.belongsTo(ExamSession, { foreignKey: 'examSessionId' });

// Enrollment and Grade Relations
Enrollment.hasOne(Grade, { foreignKey: 'enrollmentId' });
Enrollment.hasMany(TuitionPayment, { foreignKey: 'enrollmentId' });
Grade.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });

// Course Relations with Admin
Course.belongsTo(Admin, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});
Course.belongsTo(Admin, { 
  foreignKey: 'updatedBy', 
  as: 'updater' 
});

module.exports = {
  sequelize,
  Admin,
  AdminActivity,
  Certificate,
  CertificateRequirement,
  CertificateType,
  Class,
  Course,
  CourseRequest,
  Enrollment,
  ExamRegistration,
  ExamSession,
  Grade,
  Instructor,
  SalaryPayment,
  Student,
  TuitionPayment,
  User
}; 