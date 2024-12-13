const { Student, User, Enrollment, Class, Course, Instructor } = require('../models');
const { ApiError } = require('../utils/apiError');
const { validateStudentUpdate } = require('../validators/student.validator');

class StudentController {
  async getCurrentStudent(req, res, next) {
    try {
      console.log('Getting student profile for user:', req.user.id);
      
      const student = await Student.findOne({
        where: { user_id: req.user.id },
        include: [{
          model: User,
          attributes: ['email']
        }]
      });

      console.log('Found student:', student);

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const response = {
        id: student.id,
        user_id: student.user_id,
        full_name: student.full_name,
        email: student.User.email,
        phone: student.phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth,
        created_at: student.created_at,
        updated_at: student.updated_at
      };

      console.log('Sending response:', response);

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error in getCurrentStudent:', error);
      next(error);
    }
  }

  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.findOne({
        where: { id, user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const { error, value } = validateStudentUpdate(updateData);
      if (error) {
        throw new ApiError(400, 'Dữ liệu không hợp lệ', error.details);
      }

      await student.update(value);

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnrolledCourses(studentId) {
    try {
      console.log('Getting enrolled courses for student:', studentId);
      
      const enrollments = await Enrollment.findAll({
        where: { 
          student_id: studentId,
          status: 'enrolled'
        },
        include: [{
          model: Class,
          required: true,
          attributes: ['id', 'class_code', 'schedule', 'room', 'start_date', 'end_date'],
          include: [
            {
              model: Course,
              required: true,
              attributes: ['id', 'code', 'name', 'credits', 'type']
            },
            {
              model: Instructor,
              required: true,
              attributes: ['id', 'full_name']
            }
          ]
        }],
        attributes: ['id', 'status', 'enrolled_at']
      });

      console.log('Found enrollments:', JSON.stringify(enrollments, null, 2));

      // Format lại dữ liệu trả về
      const formattedCourses = enrollments.map(enrollment => ({
        id: enrollment.Class.Course.id,
        name: enrollment.Class.Course.name,
        code: enrollment.Class.Course.code,
        credits: enrollment.Class.Course.credits,
        type: enrollment.Class.Course.type,
        class_id: enrollment.Class.id,
        class_code: enrollment.Class.class_code,
        instructor: enrollment.Class.Instructor.full_name,
        schedule: enrollment.Class.schedule || 'Chưa cập nhật',
        start_date: enrollment.Class.start_date || 'Chưa cập nhật',
        end_date: enrollment.Class.end_date || 'Chưa cập nhật',
        room: enrollment.Class.room || 'Chưa cập nhật',
        status: enrollment.status === 'enrolled' ? 'Đang học' : 'Đã kết thúc',
        enrolled_at: enrollment.enrolled_at
      }));

      console.log('Formatted courses:', JSON.stringify(formattedCourses, null, 2));

      return formattedCourses;

    } catch (error) {
      console.error('Error in getEnrolledCourses:', error);
      throw new ApiError(500, 'Không thể lấy danh sách môn học đã đăng ký', error);
    }
  }
}

module.exports = new StudentController(); 