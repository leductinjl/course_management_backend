const { Grade, Enrollment, Class, Course, Student } = require('../models');
const { ApiError } = require('../utils/apiError');

class StudentGradeController {
  async getMyGrades(req, res, next) {
    try {
      const userId = req.user?.id;
      console.log('User ID:', userId);
      
      if (!userId) {
        throw new ApiError(401, 'Không tìm thấy thông tin người dùng');
      }

      const student = await Student.findOne({
        where: { user_id: userId }
      });
      console.log('Found student:', student?.id);

      if (!student) {
        throw new ApiError(401, 'Không tìm thấy thông tin học viên');
      }

      const enrollments = await Enrollment.findAll({
        where: { 
          student_id: student.id,
          status: ['enrolled', 'completed']
        },
        include: [
          {
            model: Class,
            include: [{ 
              model: Course,
              attributes: ['code', 'name']
            }]
          },
          {
            model: Grade,
            required: false
          }
        ],
        order: [[Class, 'created_at', 'DESC']]
      });

      console.log('Raw enrollments:', JSON.stringify(enrollments, null, 2));

      const grades = enrollments.map(enrollment => ({
        id: enrollment.Grade?.id || enrollment.id,
        courseCode: enrollment.Class.Course.code,
        courseName: enrollment.Class.Course.name,
        semester: enrollment.Class.semester || 'N/A',
        attendance_score: enrollment.Grade?.attendance_score ? parseFloat(enrollment.Grade.attendance_score) : null,
        midterm_score: enrollment.Grade?.midterm_score ? parseFloat(enrollment.Grade.midterm_score) : null,
        final_score: enrollment.Grade?.final_score ? parseFloat(enrollment.Grade.final_score) : null,
        total_score: enrollment.Grade?.total_score ? parseFloat(enrollment.Grade.total_score) : null,
        status: enrollment.Grade?.grade_status || 'pending'
      }));

      console.log('Processed grades with numbers:', grades);

      res.json({
        success: true,
        data: grades
      });

    } catch (error) {
      console.error('Error in getMyGrades:', error);
      next(new ApiError(error.status || 500, error.message || 'Không thể lấy kết quả học tập'));
    }
  }
}

module.exports = new StudentGradeController(); 