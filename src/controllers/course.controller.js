const { Course, Admin } = require('../models');
const { validateCourse } = require('../validators/course.validator');
const { ApiError } = require('../utils/apiError');
const { courseActivityLogger } = require('../utils/activityLogger');

class CourseController {
  async listCourses(req, res, next) {
    try {
      const courses = await Course.findAll({
        include: [{
          model: Admin,
          as: 'creator',
          attributes: ['id', 'fullName']
        }],
        order: [['created_at', 'DESC']]
      });
      
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
        include: [{
          model: Admin,
          as: 'creator',
          attributes: ['id', 'fullName']
        }]
      });

      if (!course) {
        return next(new ApiError(404, 'Course not found'));
      }

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
        createdBy: req.admin.id,
        updatedBy: req.admin.id
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
      const courseId = req.params.id;
      const updateData = req.body;

      // Tìm khóa học cần cập nhật
      const course = await Course.findByPk(courseId);
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
        updatedBy: req.admin.id
      });

      // Lấy thông tin admin đã cập nhật
      const updatedCourseWithAdmin = await Course.findByPk(courseId, {
        include: [{
          model: Admin,
          as: 'creator',
          attributes: ['id', 'fullName']
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
        return next(new ApiError(404, 'Course not found'));
      }

      await course.destroy();
      await courseActivityLogger.logDeletion(req.admin.id, course);

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      next(new ApiError(500, 'Error deleting course'));
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
}

module.exports = new CourseController();
