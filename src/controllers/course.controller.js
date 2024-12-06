const courseService = require('../services/course.service');
const { validateCourse } = require('../validators/course.validator');
const ApiError = require('../utils/ApiError');

const courseController = {
  async createCourse(req, res, next) {
    try {
      const { error } = validateCourse(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const courseData = {
        ...req.body,
        createdBy: req.admin.id,
        updatedBy: req.admin.id
      };

      const course = await courseService.createCourse(courseData);
      res.status(201).json({
        success: true,
        message: 'Tạo môn học thành công',
        data: course
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCourseRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const { error } = validateStatusUpdate(req.body);
      
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const updatedRequest = await courseService.updateCourseRequestStatus(
        id,
        status,
        adminNotes,
        req.admin.id
      );

      res.json({
        success: true,
        message: 'Cập nhật trạng thái yêu cầu thành công',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  },

  async getCourseRequests(req, res, next) {
    try {
      const requests = await courseService.getCourseRequests();
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = courseController; 