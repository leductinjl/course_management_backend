const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const { Admin } = require('../models');
const authConfig = require('../config/auth.config');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Không tìm thấy token xác thực'));
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      
      const admin = await Admin.findOne({ 
        where: { 
          id: decoded.id,
          status: 'active'
        } 
      });

      if (!admin) {
        return next(new ApiError(401, 'Admin không tồn tại hoặc đã bị vô hiệu hóa'));
      }

      req.admin = admin;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.headers['x-refresh-token'];
        if (!refreshToken) {
          return next(new ApiError(401, 'Token hết hạn, vui lòng đăng nhập lại'));
        }

        try {
          const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);
          
          const newToken = jwt.sign(
            { id: decoded.id },
            authConfig.jwt.secret,
            { expiresIn: authConfig.jwt.expiresIn }
          );

          res.setHeader('x-new-token', newToken);
          
          const admin = await Admin.findOne({ 
            where: { 
              id: decoded.id,
              status: 'active'
            } 
          });

          if (!admin) {
            return next(new ApiError(401, 'Admin không tồn tại hoặc đã bị vô hiệu hóa'));
          }

          req.admin = admin;
          next();
        } catch (refreshError) {
          return next(new ApiError(401, 'Refresh token không hợp lệ, vui lòng đăng nhập lại'));
        }
      } else {
        return next(new ApiError(401, 'Token không hợp lệ'));
      }
    }
  } catch (error) {
    next(new ApiError(500, 'Lỗi xác thực'));
  }
};

module.exports = authMiddleware; 