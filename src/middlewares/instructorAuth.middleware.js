const { User, Instructor } = require('../models');
const { ApiError } = require('../utils/apiError');

const instructorAuthMiddleware = async (req, res, next) => {
  try {
    // req.user should already be set by the general auth middleware
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (req.user.role !== 'instructor') {
      throw new ApiError(403, 'Access denied. Instructor privileges required.');
    }

    // Get instructor profile
    const instructor = await Instructor.findOne({
      where: { userId: req.user.id }
    });

    if (!instructor) {
      throw new ApiError(404, 'Instructor profile not found');
    }

    // Attach instructor profile to request
    req.instructor = instructor;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = instructorAuthMiddleware; 