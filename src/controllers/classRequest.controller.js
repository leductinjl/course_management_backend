const { ClassRequest, Course, Instructor, Admin, Class } = require('../models');
const { validateClassRequest } = require('../validators/classRequest.validator');
const { ApiError } = require('../utils/apiError');
const { generateClassCode } = require('../utils/generateClassCode');
const { Op } = require('sequelize'); 

class ClassRequestController {
  async createRequest(req, res, next) {
    try {
      const { error, value } = validateClassRequest(req.body);
      if (error) {
        return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.details));
      }

      // Kiểm tra khóa học tồn tại và đang active
      const course = await Course.findOne({
        where: {
          id: value.course_id,
          status: ['active', 'draft']
        }
      });

      if (!course) {
        return next(new ApiError(404, 'Không tìm thấy khóa học hoặc khóa học không khả dụng'));
      }

      // Tạo yêu cầu mở lớp
      const classRequest = await ClassRequest.create({
        ...value,
        instructor_id: req.instructor.id,
        status: 'pending'
      });

      // Lấy thông tin chi tiết kèm theo course
      const detailedRequest = await ClassRequest.findByPk(classRequest.id, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Yêu cầu mở lớp đã được gửi thành công',
        data: detailedRequest
      });
    } catch (error) {
      console.error('Error creating class request:', error);
      next(new ApiError(500, 'Lỗi khi tạo yêu cầu mở lớp'));
    }
  }

  async getInstructorRequests(req, res, next) {
    try {
      const requests = await ClassRequest.findAll({
        where: {
          instructor_id: req.instructor.id
        },
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Error fetching instructor requests:', error);
      next(new ApiError(500, 'Lỗi khi lấy danh sách yêu cầu'));
    }
  }

  async updateRequest(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate input
      const { error, value } = validateClassRequest(updateData);
      if (error) {
        return next(new ApiError(400, 'Dữ liệu không hợp lệ', error.details));
      }

      // Find the request
      const request = await ClassRequest.findOne({
        where: {
          id,
          instructor_id: req.instructor.id,
          status: 'pending' // Chỉ cho phép cập nhật yêu cầu đang chờ
        },
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }]
      });

      if (!request) {
        return next(new ApiError(404, 'Không tìm thấy yêu cầu hoặc không có quyền cập nhật'));
      }

      // Check if course exists and is available
      const course = await Course.findOne({
        where: {
          id: value.course_id,
          status: ['active', 'draft']
        }
      });

      if (!course) {
        return next(new ApiError(404, 'Không tìm thấy khóa học hoặc khóa học không khả dụng'));
      }

      // Update the request
      await request.update(value);

      // Fetch updated request with course info
      const updatedRequest = await ClassRequest.findByPk(id, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }]
      });

      res.json({
        success: true,
        message: 'Cập nhật yêu cầu thành công',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error updating class request:', error);
      next(new ApiError(500, 'Lỗi khi cập nhật yêu cầu'));
    }
  }

  async deleteRequest(req, res, next) {
    try {
      const { id } = req.params;
      
      const request = await ClassRequest.findOne({
        where: {
          id,
          instructor_id: req.instructor.id,
          status: 'pending'
        }
      });

      if (!request) {
        return next(new ApiError(404, 'Không tìm thấy yêu cầu hoặc không có quyền xóa'));
      }

      await request.destroy();

      res.json({
        success: true,
        message: 'Xóa yêu cầu thành công'
      });
    } catch (error) {
      next(new ApiError(500, 'Lỗi khi xóa yêu cầu'));
    }
  }

  async getAllRequests(req, res, next) {
    try {
      const requests = await ClassRequest.findAll({
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Instructor,
            as: 'instructor',
            attributes: ['id', 'full_name']
          },
          {
            model: Admin,
            as: 'reviewer',
            attributes: ['id', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(new ApiError(500, 'Lỗi khi lấy danh sách yêu cầu'));
    }
  }

  async reviewRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      // Validate input
      if (!status || !['approved', 'rejected'].includes(status)) {
        return next(new ApiError(400, 'Trạng thái không hợp lệ'));
      }

      const request = await ClassRequest.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
          },
          {
            model: Instructor,
            as: 'instructor',
          }
        ]
      });

      if (!request) {
        return next(new ApiError(404, 'Không tìm thấy yêu cầu'));
      }

      if (request.status !== 'pending') {
        return next(new ApiError(400, 'Yêu cầu này đã được xử lý'));
      }

      // Kiểm tra xác thực admin
      if (!req.admin || !req.admin.id) {
        return next(new ApiError(401, 'Không có quyền thực hiện thao tác này'));
      }

      await request.update({
        status,
        admin_notes: admin_notes || null,
        reviewed_by: req.admin.id,
        reviewed_at: new Date()
      });

      const updatedRequest = await ClassRequest.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Instructor,
            as: 'instructor',
            attributes: ['id', 'full_name']
          },
          {
            model: Admin,
            as: 'reviewer',
            attributes: ['id', 'full_name']
          }
        ]
      });

      res.json({
        success: true,
        message: status === 'approved' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error reviewing request:', error);
      next(new ApiError(500, 'Lỗi khi xử lý yêu cầu'));
    }
  }
}

module.exports = new ClassRequestController();
