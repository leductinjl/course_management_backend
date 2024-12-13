const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = authMiddleware; 