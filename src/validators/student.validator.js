const Joi = require('joi');

const validateStudentUpdate = (data) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    address: Joi.string().max(255),
    date_of_birth: Joi.date().iso().less('now')
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateStudentUpdate
}; 