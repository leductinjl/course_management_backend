const Joi = require('joi');

const classSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  instructorId: Joi.string().uuid().required(),
  classCode: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  schedule: Joi.string().required(),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming'),
  room: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  maxStudents: Joi.number().integer().min(1),
  description: Joi.string().allow('', null)
}).custom((value, helpers) => {
  if (value.endDate <= value.startDate) {
    return helpers.error('date.endAfterStart', { message: 'Ngày kết thúc phải sau ngày bắt đầu' });
  }
  return value;
});

const validateClass = (data) => {
  return classSchema.validate(data, { 
    abortEarly: false,
    messages: {
      'date.endAfterStart': 'Ngày kết thúc phải sau ngày bắt đầu'
    }
  });
};

module.exports = { validateClass }; 