const sequelize = require('../config/database');
const Admin = require('./admin.model');
const AdminActivity = require('./admin_activity.model');
const Certificate = require('./certificate.model');
const CertificateRequirement = require('./certificate_requirement.model');
const CertificateType = require('./certificate_type.model');
const Class = require('./class.model');
const Course = require('./course.model');
const CourseRequest = require('./course_request.model');
const Enrollment = require('./enrollment.model');
const ExamRegistration = require('./exam_registration.model');
const ExamSession = require('./exam_session.model');
const Grade = require('./grade.model');
const Instructor = require('./instructor.model');
const SalaryPayment = require('./salary_payment.model');
const Student = require('./student.model');
const TuitionPayment = require('./tuition_payment.model');
const User = require('./user.model');
const InstructorAchievement = require('./instructor_achievement.model');
const InstructorCertificate = require('./instructor_certificate.model');
const InstructorWorkHistory = require('./instructor_work_history.model');
const EnrollmentHistory = require('./enrollment_history.model');

// User Relations
User.hasOne(Student, { 
  foreignKey: 'user_id', 
  as: 'studentProfile',
  onDelete: 'CASCADE'
});
User.hasOne(Instructor, { 
  foreignKey: 'user_id', 
  as: 'instructor',
  onDelete: 'CASCADE'
});
Student.belongsTo(User, { foreignKey: 'user_id' });
Instructor.belongsTo(User, { foreignKey: 'user_id' });

// Admin Relations
Admin.hasMany(AdminActivity, { foreignKey: 'admin_id' });
Admin.hasMany(Course, { foreignKey: 'created_by', as: 'createdCourses' });
Admin.hasMany(Course, { foreignKey: 'updated_by', as: 'updatedCourses' });
Admin.hasMany(Class, { foreignKey: 'created_by', as: 'createdClasses' });
Admin.hasMany(ExamSession, { foreignKey: 'created_by', as: 'createdExamSessions' });
Admin.hasMany(CertificateType, { foreignKey: 'created_by', as: 'createdCertificateTypes' });
Admin.hasMany(Certificate, { foreignKey: 'issued_by', as: 'issuedCertificates' });
Admin.hasMany(CourseRequest, { foreignKey: 'reviewed_by', as: 'reviewedRequests' });

// Additional Admin Relations
AdminActivity.belongsTo(Admin, { foreignKey: 'admin_id' });
Admin.hasMany(CertificateRequirement, { foreignKey: 'created_by', as: 'createdRequirements' });
Admin.hasMany(TuitionPayment, { foreignKey: 'confirmed_by', as: 'confirmedTuitions' });
Admin.hasMany(SalaryPayment, { foreignKey: 'processed_by', as: 'processedSalaries' });
Admin.hasMany(Student, { foreignKey: 'created_by', as: 'createdStudents' });
Admin.hasMany(Instructor, { foreignKey: 'created_by', as: 'createdInstructors' });
Admin.hasMany(Enrollment, { foreignKey: 'processed_by', as: 'processedEnrollments' });
Admin.hasMany(Grade, { foreignKey: 'verified_by', as: 'verifiedGrades' });

// Course and Class Relations
Course.hasMany(Class, { foreignKey: 'course_id' });
Course.hasMany(CourseRequest, { foreignKey: 'course_id' });
Course.hasMany(CertificateRequirement, { foreignKey: 'course_id' });
Class.belongsTo(Course, { foreignKey: 'course_id' });
Class.belongsTo(Instructor, { foreignKey: 'instructor_id' });
Class.hasMany(Enrollment, { foreignKey: 'class_id' });

// Instructor Relations
Instructor.hasMany(Class, { foreignKey: 'instructor_id' });
Instructor.hasMany(CourseRequest, { foreignKey: 'instructor_id' });
Instructor.hasMany(SalaryPayment, { foreignKey: 'instructor_id' });
Instructor.hasMany(Grade, { foreignKey: 'last_updated_by', as: 'gradesUpdated' });

// Student Relations
Student.hasMany(Enrollment, { foreignKey: 'student_id' });
Student.hasMany(ExamRegistration, { foreignKey: 'student_id' });
Student.hasMany(Certificate, { foreignKey: 'student_id' });
Student.hasMany(TuitionPayment, { foreignKey: 'student_id' });

// Certificate Relations
CertificateType.hasMany(Certificate, { foreignKey: 'certificate_type_id' });
CertificateType.hasMany(CertificateRequirement, { foreignKey: 'certificate_type_id' });
Certificate.belongsTo(CertificateType, { foreignKey: 'certificate_type_id' });

// Exam Relations
ExamSession.hasMany(ExamRegistration, { foreignKey: 'exam_session_id' });
ExamRegistration.belongsTo(ExamSession, { foreignKey: 'exam_session_id' });

// Enrollment and Grade Relations
Enrollment.hasOne(Grade, { foreignKey: 'enrollment_id' });
Enrollment.hasMany(TuitionPayment, { foreignKey: 'enrollment_id' });
Grade.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });

// Course Relations with Admin
Course.belongsTo(Admin, { 
  as: 'creator', 
  foreignKey: 'created_by' 
});

Course.belongsTo(Admin, { 
  as: 'updater', 
  foreignKey: 'updated_by' 
});

Course.belongsToMany(Instructor, {
  through: 'course_instructors',
  foreignKey: 'course_id',
  otherKey: 'instructor_id',
  as: 'instructors'
});

Instructor.belongsToMany(Course, {
  through: 'course_instructors',
  foreignKey: 'instructor_id',
  otherKey: 'course_id',
  as: 'courses'
});

Course.associate = (models) => {
  Course.hasMany(models.Class, {
    foreignKey: 'course_id',
    as: 'Classes'
  });
};

// Class Relations
Class.belongsTo(Course, { foreignKey: 'course_id' });
Class.belongsTo(Instructor, { foreignKey: 'instructor_id' });
Class.belongsTo(Admin, { as: 'creator', foreignKey: 'created_by' });

// Course Relations
Course.hasMany(Class, { foreignKey: 'course_id' });

// Instructor Relations
Instructor.hasMany(Class, { foreignKey: 'instructor_id' });

// Admin Relations with Class
Admin.hasMany(Class, { 
  foreignKey: 'created_by', 
  as: 'classesCreated' 
});

// Define associations
Instructor.belongsTo(User, {
  foreignKey: 'user_id',  
  as: 'users'
});

User.hasOne(Instructor, {
  foreignKey: 'user_id',
  as: 'instructorProfile'
});

// Instructor Achievement associations
Instructor.hasMany(InstructorAchievement, { foreignKey: 'instructor_id' });
InstructorAchievement.belongsTo(Instructor, { foreignKey: 'instructor_id' });

// Instructor Certificate associations
Instructor.hasMany(InstructorCertificate, { foreignKey: 'instructor_id' });
InstructorCertificate.belongsTo(Instructor, { foreignKey: 'instructor_id' });

// Instructor Work History associations
Instructor.hasMany(InstructorWorkHistory, { foreignKey: 'instructor_id' });
InstructorWorkHistory.belongsTo(Instructor, { foreignKey: 'instructor_id' });

// Define associations
Enrollment.belongsTo(Class, { foreignKey: 'class_id' });
Class.hasMany(Enrollment, { foreignKey: 'class_id' });

Enrollment.belongsTo(Student, { foreignKey: 'student_id' });
Student.hasMany(Enrollment, { foreignKey: 'student_id' });

Class.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Class, { foreignKey: 'course_id' });

Class.belongsTo(Instructor, { foreignKey: 'instructor_id' });
Instructor.hasMany(Class, { foreignKey: 'instructor_id' });

// EnrollmentHistory associations
EnrollmentHistory.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Enrollment.hasMany(EnrollmentHistory, { foreignKey: 'enrollment_id' });

EnrollmentHistory.belongsTo(Student, { foreignKey: 'student_id' });
Student.hasMany(EnrollmentHistory, { foreignKey: 'student_id' });

EnrollmentHistory.belongsTo(Class, { foreignKey: 'class_id' });
Class.hasMany(EnrollmentHistory, { foreignKey: 'class_id' });

// EnrollmentHistory associations
EnrollmentHistory.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'classes'
});

Class.hasMany(EnrollmentHistory, {
  foreignKey: 'class_id',
  as: 'enrollment_histories'
});

EnrollmentHistory.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'students'
});

Student.hasMany(EnrollmentHistory, {
  foreignKey: 'student_id',
  as: 'enrollment_histories'
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
  User,
  InstructorAchievement,
  InstructorCertificate,
  InstructorWorkHistory,
  EnrollmentHistory
}; 