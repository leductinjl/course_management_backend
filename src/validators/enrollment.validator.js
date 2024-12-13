const Joi = require('joi');

const enrollmentSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  status: Joi.string().valid('enrolled', 'completed', 'dropped')
});

const validateEnrollment = (data) => {
  return enrollmentSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateEnrollment
}; 