const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../utils/apiError');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'status']
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, 'Account is inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = authMiddleware; 