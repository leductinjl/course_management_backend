// backendcourse/src/middlewares/adminAuth.middleware.js
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { ApiError } = require('../utils/apiError');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No authorization header found');
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    // Check both role and isAdmin flag
    if (decoded.role !== 'admin' || !decoded.isAdmin) {
      throw new ApiError(403, 'Access denied. Admin privileges required.');
    }

    const admin = await Admin.findOne({
      where: {
        id: decoded.id,
        status: 'active'
      },
      attributes: ['id', 'email', 'admin_type', 'full_name', 'status']
    });

    if (!admin) {
      throw new ApiError(403, 'Admin account not found or inactive');
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      admin_type: admin.admin_type,
      full_name: admin.full_name
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuthMiddleware;