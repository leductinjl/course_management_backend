const { ApiError } = require('../utils/apiError');
const { Instructor } = require('../models');

const instructorAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized - No user found');
    }

    const instructor = await Instructor.findOne({
      where: { user_id: req.user.id }
    });

    if (!instructor) {
      throw new ApiError(403, 'Forbidden - Not an instructor');
    }

    req.instructor = instructor;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = instructorAuthMiddleware; 