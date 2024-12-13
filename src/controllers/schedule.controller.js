const { Enrollment, Class, Course, Instructor, Student } = require('../models');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');

class ScheduleController {
  async getStudentSchedule(req, res, next) {
    try {
      // Lấy student_id từ user_id trong token
      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      // Lấy danh sách các lớp học sinh đã đăng ký
      const enrollments = await Enrollment.findAll({
        where: {
          student_id: student.id,
          status: 'enrolled'
        },
        include: [{
          model: Class,
          required: true,
          include: [
            {
              model: Course,
              attributes: ['name', 'code'],
              required: true
            },
            {
              model: Instructor,
              attributes: ['full_name'],
              required: true
            }
          ],
          where: {
            status: ['upcoming', 'ongoing'], // Chỉ lấy các lớp sắp diễn ra và đang diễn ra
            end_date: {
              [Op.gte]: new Date() // Chỉ lấy các lớp chưa kết thúc
            }
          }
        }]
      });

      // Chuyển đổi dữ liệu thành định dạng phù hợp với frontend
      const schedule = enrollments.map(enrollment => ({
        id: enrollment.Class.id,
        class_code: enrollment.Class.class_code,
        schedule: enrollment.Class.schedule,
        room: enrollment.Class.room,
        start_date: enrollment.Class.start_date,
        end_date: enrollment.Class.end_date,
        Course: {
          code: enrollment.Class.Course.code,
          name: enrollment.Class.Course.name
        },
        Instructor: {
          full_name: enrollment.Class.Instructor.full_name
        }
      }));

      // Log để debug
      console.log('Found enrollments:', JSON.stringify(schedule, null, 2));

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Error getting student schedule:', error);
      next(new ApiError(500, 'Không thể lấy thời khóa biểu'));
    }
  }
}

module.exports = new ScheduleController();
