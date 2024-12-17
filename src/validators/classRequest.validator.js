const Joi = require('joi');

const validateClassRequest = (data) => {
  const schema = Joi.object({
    course_id: Joi.string().uuid().required(),
    expected_students: Joi.number().integer().min(1).required(),
    desired_start_date: Joi.date()
      .min(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)) // 28 days from now
      .required(),
    schedule_note: Joi.string().required(),
    reason: Joi.string().required()
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateClassRequest
};
