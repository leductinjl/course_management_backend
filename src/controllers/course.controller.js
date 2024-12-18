const { Course, Admin, Instructor } = require('../models');
const { validateCourse } = require('../validators/course.validator');
const { ApiError } = require('../utils/apiError');
const { courseActivityLogger } = require('../utils/activityLogger');

class CourseController {
  async listCourses(req, res, next) {
    try {
      const courses = await Course.findAll({
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'full_name']
          },
          {
            model: Admin,
            as: 'updater',
            attributes: ['id', 'full_name']
          },
          {
            model: Instructor,
            as: 'instructors',
            attributes: ['id', 'full_name', 'specialization'],
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // Debug log to check the data
      console.log('Courses with instructors:', JSON.stringify(courses, null, 2));
      
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      next(new ApiError(500, 'Error fetching courses'));
    }
  }

  async getCourse(req, res, next) {
    try {
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'full_name']
          },
          {
            model: Admin,
            as: 'updater',
            attributes: ['id', 'full_name']
          },
          {
            model: Instructor,
            as: 'instructors',
            attributes: ['id', 'full_name', 'specialization'],
            through: { attributes: [] }
          }
        ]
      });

      if (!course) {
        return next(new ApiError(404, 'Course not found'));
      }

      // Debug log
      console.log('Course detail:', JSON.stringify(course, null, 2));

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      next(new ApiError(500, 'Error fetching course'));
    }
  }

  async createCourse(req, res, next) {
    try {
      const { error } = validateCourse(req.body);
      if (error) {
        return next(new ApiError(400, 'Invalid course data', error.details));
      }

      const course = await Course.create({
        ...req.body,
        created_by: req.admin.id,
        updated_by: req.admin.id
      });

      await courseActivityLogger.logCreation(req.admin.id, course);

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return next(new ApiError(400, 'Course code already exists'));
      }
      next(new ApiError(500, 'Error creating course'));
    }
  }

  async updateCourse(req, res, next) {
    try {
      const course_id = req.params.id;
      const updateData = req.body;

      // Tìm khóa học cần cập nhật
      const course = await Course.findByPk(course_id);
      if (!course) {
        return next(new ApiError(404, 'Không tìm thấy khóa học'));
      }

      // Validate dữ liệu cập nhật
      const { error, value } = validateCourse(updateData, true);
      if (error) {
        return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))));
      }

      // Cập nhật thông tin khóa học với dữ liệu đã được validate
      const updatedCourse = await course.update({
        ...value, // Sử dụng dữ liệu đã được validate
        updated_by: req.admin.id
      });

      // Lấy thông tin admin đã cập nhật
      const updatedCourseWithAdmin = await Course.findByPk(course_id, {
        include: [{
          model: Admin,
          as: 'creator',
          attributes: ['id', 'full_name']
        }]
      });

      // Log hoạt động
      await courseActivityLogger.logUpdate(req.admin.id, course, value);

      res.json({
        success: true,
        message: 'Cập nhật khóa học thành công',
        data: updatedCourseWithAdmin
      });

    } catch (error) {
      console.error('Error updating course:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return next(new ApiError(400, 'Mã khóa học đã tồn tại'));
      }
      if (error.name === 'SequelizeValidationError') {
        return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))));
      }
      next(new ApiError(500, 'Lỗi khi cập nhật khóa học'));
    }
  }

  async deleteCourse(req, res, next) {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) {
        return next(new ApiError(404, 'Không tìm thấy môn học'));
      }

      try {
        await course.destroy();
        await courseActivityLogger.logDeletion(req.admin.id, course);

        res.json({
          success: true,
          message: 'Xóa môn học thành công'
        });
      } catch (error) {
        console.error('Error details:', error);
        
        // Xử lý lỗi foreign key constraint
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          let errorMessage = 'Không thể xóa môn học vì còn dữ liệu liên quan';
          
          // Kiểm tra bảng liên quan để đưa ra thông báo cụ thể
          if (error.table === 'classes') {
            errorMessage = 'Không thể xóa môn học này vì đang có lớp học liên kết. Vui lòng xóa các lớp học trước.';
          } else if (error.table === 'enrollment_histories') {
            errorMessage = 'Không thể xóa môn học này vì đã có sinh viên đăng ký học. Vui lòng kiểm tra lại lịch sử đăng ký.';
          }

          return next(new ApiError(409, errorMessage, {
            details: {
              constraint: error.index,
              table: error.table
            }
          }));
        }

        throw error; // Ném lỗi để xử lý ở catch block bên ngoài
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      next(new ApiError(500, 'Lỗi khi xóa môn học', {
        details: error.message
      }));
    }
  }

  async getAvailableCourses() {
    try {
     const courses = await Course.findAll({
        where: { status: 'ACTIVE' },
        attributes: ['id', 'name', 'code']
      });
      return courses;
    } catch (error) {
      console.error('Error in getAvailableCourses:', error);
      throw new ApiError(500, 'Lỗi khi lấy danh sách môn học');
    }
  }

  async assignInstructors(req, res, next) {
    try {
      const { course_id } = req.params;
      const { instructor_ids } = req.body;

      const course = await Course.findByPk(course_id);
      if (!course) {
        throw new ApiError(404, 'Không tìm thấy khóa học');
      }

      // Set the instructors for the course
      await course.setInstructors(instructor_ids);

      // Fetch updated course with instructors
      const updatedCourse = await Course.findByPk(course_id, {
        include: [{
          model: Instructor,
          as: 'instructors',
          attributes: ['id', 'full_name', 'specialization'],
          through: { attributes: [] }
        }]
      });

      res.json({
        success: true,
        message: 'Cập nhật giảng viên thành công',
        data: updatedCourse
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentAvailableCourses() {
    try {
      const courses = await Course.findAll({
        where: {
          status: ['active', 'draft'], // Chỉ lấy các môn đang mở hoặc sắp mở
        },
        include: [
          {
            model: Instructor,
            as: 'instructors',
            attributes: ['id', 'full_name', 'specialization'],
            through: { attributes: [] }
          }
        ],
        attributes: [
          'id', 'code', 'name', 'description', 'credits', 
          'type', 'status', 'fee', 'created_at', 'updated_at'
        ],
        order: [
          ['status', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      // Log để debug
      console.log('Found courses:', JSON.stringify(courses, null, 2));

      // Format lại response để dễ sử dụng ở frontend
      const formattedCourses = courses.map(course => {
        const courseJson = course.toJSON();
        return {
          ...courseJson,
          instructors: courseJson.instructors || []
        };
      });

      // Log formatted courses
      console.log('Formatted courses:', JSON.stringify(formattedCourses, null, 2));

      return formattedCourses;
    } catch (error) {
      console.error('Error in getStudentAvailableCourses:', error);
      throw new ApiError(500, 'Lỗi khi lấy danh sách môn học');
    }
  }

  async getAvailableCoursesForInstructor(req, res, next) {
    try {
      const courses = await Course.findAll({
        where: {
          status: ['active', 'draft'] // Chỉ lấy các khóa học đang mở hoặc sắp mở
        },
        attributes: [
          'id', 
          'code', 
          'name', 
          'description', 
          'credits',
          'type',
          'status',
          'fee'
        ],
        order: [
          ['status', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error in getAvailableCoursesForInstructor:', error);
      next(new ApiError(500, 'Lỗi khi lấy danh sách khóa học'));
    }
  }
}

module.exports = new CourseController();
