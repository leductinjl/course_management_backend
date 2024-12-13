const { ApiError } = require('../utils/apiError');
const { Instructor } = require('../models');

const instructorAuthMiddleware = async (req, res, next) => {
  try {
    console.log('Checking instructor auth for user:', req.user.id);

    const instructor = await Instructor.findOne({
      where: { user_id: req.user.id }
    });

    console.log('Found instructor:', instructor);

    if (!instructor) {
      console.log('No instructor found for user_id:', req.user.id);
      throw new ApiError(403, 'Access denied. User is not an instructor');
    }

    req.instructor = instructor;
    console.log('Instructor auth successful');
    next();
  } catch (error) {
    console.error('Instructor auth middleware error:', error);
    next(error);
  }
};

module.exports = instructorAuthMiddleware; 