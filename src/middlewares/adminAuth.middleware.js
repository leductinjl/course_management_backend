// backendcourse/src/middlewares/adminAuth.middleware.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['Authorization'];
    
    if (!authHeader) {
      throw new ApiError(401, 'No authorization header found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Specifically check for admin type
    if (!decoded.adminType) {
      throw new ApiError(403, 'Access denied. Admin privileges required.');
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      adminType: decoded.adminType
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

module.exports = adminAuthMiddleware;