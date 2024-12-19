const { Class, Course, Enrollment, Student, EnrollmentHistory, Tuition } = require('../models');
const { ApiError } = require('../utils/apiError');
const { checkScheduleConflict } = require('../utils/scheduleUtils');

class EnrollmentController {
  async enrollClass(req, res, next) {
    try {
      const { class_id } = req.body;
      
      // Lấy thông tin lớp học mới muốn đăng ký
      const newClass = await Class.findOne({
        where: { id: class_id },
        include: [{ 
          model: Course,
          attributes: ['id', 'name', 'code'] 
        }]
      });
      
      if (!newClass) {
        throw new ApiError(404, 'Không tìm thấy lớp học');
      }

      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      // Lấy TẤT CẢ các lớp học đã đăng ký (enrolled) của sinh viên
      const enrolledClasses = await Enrollment.findAll({
        where: {
          student_id: student.id,
          status: 'enrolled'
        },
        include: [{
          model: Class,
          required: true,
          include: [{
            model: Course,
            attributes: ['id', 'name', 'code']
          }]
        }]
      });

      // Kiểm tra trùng lịch với TẤT CẢ các lớp đã đăng ký
      for (const enrollment of enrolledClasses) {
        const existingClass = enrollment.Class;
        
        console.log('Checking conflict with enrolled class:', {
          existingClass: {
            code: existingClass.Course.code,
            name: existingClass.Course.name,
            schedule: existingClass.schedule,
            startDate: existingClass.start_date,
            endDate: existingClass.end_date
          },
          newClass: {
            code: newClass.Course.code,
            name: newClass.Course.name,
            schedule: newClass.schedule,
            startDate: newClass.start_date,
            endDate: newClass.end_date
          }
        });

        const hasConflict = checkScheduleConflict(
          newClass.schedule,
          newClass.start_date,
          newClass.end_date,
          existingClass.schedule,
          existingClass.start_date,
          existingClass.end_date
        );

        if (hasConflict) {
          throw new ApiError(
            400, 
            `Lịch học bị trùng với môn ${existingClass.Course.name} (${existingClass.Course.code})`
          );
        }
      }

      // Kiểm tra xem đã đăng ký lớp khác của cùng môn học chưa
      const existingSameCourse = enrolledClasses.find(
        enrollment => enrollment.Class.Course.id === newClass.Course.id
      );

      if (existingSameCourse) {
        throw new ApiError(
          400, 
          `Bạn đã đăng ký lớp khác của môn ${newClass.Course.name} (${newClass.Course.code})`
        );
      }

      // Kiểm tra sĩ số lớp
      const enrollmentCount = await Enrollment.count({
        where: { 
          class_id,
          status: 'enrolled'
        }
      });

      if (enrollmentCount >= newClass.capacity) {
        throw new ApiError(400, 'Lớp học đã đầy');
      }

      // Kiểm tra xem đã từng đăng ký và hủy lớp này chưa
      const previousEnrollment = await Enrollment.findOne({
        where: {
          student_id: student.id,
          class_id,
          status: 'cancelled'
        }
      });

      let enrollment;
      if (previousEnrollment) {
        enrollment = await previousEnrollment.update({
          status: 'enrolled',
          enrolled_at: new Date(),
          cancelled_at: null
        });
      } else {
        enrollment = await Enrollment.create({
          student_id: student.id,
          class_id,
          status: 'enrolled',
          enrolled_at: new Date()
        });
      }

      // Ghi lịch sử đăng ký
      await EnrollmentHistory.create({
        enrollment_id: enrollment.id,
        student_id: student.id,
        class_id,
        action: 'enrolled',
        action_date: new Date(),
        note: 'Đăng ký lớp học'
      });

      // Add this code to create tuition record
      const course = await Course.findOne({
        where: { id: newClass.course_id }
      });

      await Tuition.create({
        student_id: student.id,
        enrollment_id: enrollment.id,
        amount: course.fee,
        due_date: new Date(newClass.start_date.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)), // 4 weeks after start date
        status: 'pending'
      });

      res.json({
        success: true,
        message: 'Đăng ký lớp học thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async unenrollClass(req, res, next) {
    try {
      const { class_id } = req.params;

      // Lấy thông tin student từ user_id
      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      // Tìm enrollment hiện tại
      const enrollment = await Enrollment.findOne({
        where: {
          student_id: student.id,
          class_id,
          status: 'enrolled'
        }
      });

      if (!enrollment) {
        throw new ApiError(404, 'Không tìm thấy thông tin đăng ký lớp học');
      }

      // Cập nhật trạng thái enrollment
      await enrollment.update({
        status: 'cancelled',
        cancelled_at: new Date()
      });

      // Ghi lịch sử hủy đăng ký
      await EnrollmentHistory.create({
        enrollment_id: enrollment.id,
        student_id: student.id,
        class_id,
        action: 'cancelled',
        action_date: new Date(),
        reason: req.body.reason || 'Học viên tự hủy đăng ký',
        note: req.body.note
      });

      res.json({
        success: true,
        message: 'Hủy đăng ký lớp học thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyEnrollments(req, res, next) {
    try {
      // Lấy thông tin student từ user_id
      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      // Lấy danh sách các lớp đã đăng ký
      const enrollments = await Enrollment.findAll({
        where: {
          student_id: student.id,
          status: 'enrolled'
        },
        include: [
          {
            model: Class,
            include: [
              { 
                model: Course,
                attributes: ['id', 'name', 'code', 'credits', 'fee']
              },
              {
                model: Instructor,
                attributes: ['id', 'full_name', 'specialization']
              }
            ]
          }
        ],
        order: [['enrolled_at', 'DESC']]
      });

      res.json({
        success: true,
        data: enrollments
      });
    } catch (error) {
      next(error);
    }
  }

  // Thêm method để xem lịch sử đăng ký của học viên
  async getEnrollmentHistory(req, res, next) {
    try {
      const student = await Student.findOne({
        where: { user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const history = await EnrollmentHistory.findAll({
        where: { student_id: student.id },
        include: [{
          model: Class,
          attributes: ['id', 'class_code'],
          include: [{
            model: Course,
            attributes: ['id', 'name', 'code']
          }]
        }],
        order: [['action_date', 'DESC']]
      });

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getEnrollmentHistory:', error);
      next(error);
    }
  }
}

module.exports = new EnrollmentController(); 