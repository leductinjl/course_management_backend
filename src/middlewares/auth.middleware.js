const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const { Admin, Instructor, User } = require('../models');
const authConfig = require('../config/auth.config');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Headers received:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      return next(new ApiError(401, 'Không tìm thấy token xác thực'));
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format');
      return next(new ApiError(401, 'Token không đúng định dạng'));
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token);

    if (!token) {
      console.log('No token found after Bearer');
      return next(new ApiError(401, 'Token không hợp lệ'));
    }

    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      console.log('Decoded token:', decoded);
      
      if (!decoded.role) {
        return next(new ApiError(401, 'Token không chứa thông tin role'));
      }

      // Tìm user trước
      const user = await User.findOne({
        where: {
          id: decoded.id,
          status: 'active'
        }
      });

      if (!user) {
        return next(new ApiError(401, 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'));
      }

      // Sau đó tìm profile tương ứng
      let profile;
      if (decoded.role === 'instructor') {
        profile = await Instructor.findOne({
          where: { userId: decoded.id },
          include: [{
            model: User,
            attributes: ['id', 'email']
          }]
        });
      } else if (decoded.role === 'student') {
        profile = await Student.findOne({
          where: { userId: decoded.id },
          include: [{
            model: User,
            attributes: ['id', 'email']
          }]
        });
      }

      if (!profile) {
        return next(new ApiError(401, 'Profile không tồn tại hoặc đã bị vô hiệu hóa'));
      }

      req.user = { 
        ...profile.toJSON(), 
        userId: decoded.id, 
        role: decoded.role 
      };
      console.log('User set in request:', req.user); // Debug log
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return next(new ApiError(401, `Token không hợp lệ: ${error.message}`));
    }
  } catch (error) {
    console.error('General Auth Error:', error);
    next(new ApiError(500, 'Lỗi xác thực'));
  }
};

module.exports = authMiddleware; 