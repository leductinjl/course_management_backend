const Joi = require('joi');

const classSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  instructorId: Joi.string().uuid().required(),
  classCode: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  schedule: Joi.string().required(),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming')
  // Thêm các trường khác nếu cần
});

const validateClass = (data) => {
  return classSchema.validate(data, { abortEarly: false });
};

module.exports = { validateClass }; 