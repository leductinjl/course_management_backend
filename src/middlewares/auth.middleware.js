const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const { Admin, Instructor, User } = require('../models');
const authConfig = require('../config/auth.config');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Không tìm thấy token xác thực'));
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token); // Debug log

    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      console.log('Decoded token:', decoded); // Debug log
      
      if (!decoded.role) {
        return next(new ApiError(401, 'Token không chứa thông tin role'));
      }

      // Kiểm tra role và xử lý tương ứng
      switch (decoded.role) {
        case 'admin':
          const admin = await Admin.findOne({ 
            where: { 
              id: decoded.id,
              status: 'active'
            } 
          });
          if (!admin) {
            return next(new ApiError(401, 'Admin không tồn tại hoặc đã bị vô hiệu hóa'));
          }
          req.user = { ...admin.toJSON(), role: 'admin' };
          break;

        case 'instructor':
          const instructor = await Instructor.findOne({
            where: { 
              userId: decoded.id,
              status: 'active'
            },
            include: [{
              model: User,
              attributes: ['email']
            }]
          });
          if (!instructor) {
            return next(new ApiError(401, 'Giảng viên không tồn tại hoặc đã bị vô hiệu hóa'));
          }
          req.user = { ...instructor.toJSON(), role: 'instructor' };
          break;

        case 'student':
          const student = await User.findOne({
            where: { 
              id: decoded.id,
              status: 'active',
              role: 'student'
            }
          });
          if (!student) {
            return next(new ApiError(401, 'Sinh viên không tồn tại hoặc đã bị vô hiệu hóa'));
          }
          req.user = { ...student.toJSON(), role: 'student' };
          break;

        default:
          return next(new ApiError(401, `Role không hợp lệ: ${decoded.role}`));
      }

      console.log('User set in request:', req.user); // Debug log
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error); // Debug log

      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.headers['x-refresh-token'];
        if (!refreshToken) {
          return next(new ApiError(401, 'Token hết hạn, vui lòng đăng nhập lại'));
        }

        try {
          const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);
          console.log('Refresh token decoded:', decoded); // Debug log
          
          const newToken = jwt.sign(
            { 
              id: decoded.id, 
              role: decoded.role 
            },
            authConfig.jwt.secret,
            { expiresIn: authConfig.jwt.expiresIn }
          );

          res.setHeader('x-new-token', newToken);
          req.user = { id: decoded.id, role: decoded.role };
          next();
        } catch (refreshError) {
          console.error('Refresh Token Error:', refreshError); // Debug log
          return next(new ApiError(401, 'Refresh token không hợp lệ, vui lòng đăng nhập lại'));
        }
      } else {
        return next(new ApiError(401, `Token không hợp lệ: ${error.message}`));
      }
    }
  } catch (error) {
    console.error('General Auth Error:', error); // Debug log
    next(new ApiError(500, 'Lỗi xác thực'));
  }
};

module.exports = authMiddleware; 