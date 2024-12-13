const { User } = require('../models');
const { ApiError } = require('../utils/apiError');
const jwt = require('jsonwebtoken');

const studentAuthMiddleware = async (req, res, next) => {
  try {
    // Kiểm tra header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Không tìm thấy token xác thực');
    }

    // Lấy token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Token không hợp lệ');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra role từ token
      if (decoded.role !== 'student') {
        throw new ApiError(401, 'Không có quyền truy cập - Yêu cầu quyền học viên');
      }

      // Kiểm tra user trong database
      const user = await User.findOne({
        where: {
          id: decoded.id,
          role: 'student',
          status: 'active'
        }
      });

      if (!user) {
        throw new ApiError(401, 'Người dùng không tồn tại hoặc không có quyền truy cập');
      }

      // Lưu thông tin user vào request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        student_id: user.studentProfile?.id
      };

      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Token không hợp lệ');
      }
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token đã hết hạn');
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = studentAuthMiddleware; 