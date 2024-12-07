const Joi = require('joi');

const validateCourse = (data, isUpdate = false) => {
  const baseSchema = {
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    credits: Joi.number().integer().min(1).required(),
    type: Joi.string().valid('basic', 'advanced', 'specialized').required(),
    status: Joi.string().valid('draft', 'active', 'suspended', 'discontinued').required(),
    fee: Joi.number().min(0).required()
  };

  // Nếu là update, cho phép các trường là optional
  const schema = isUpdate
    ? Joi.object(baseSchema).fork(
        Object.keys(baseSchema),
        (schema) => schema.optional()
      )
    : Joi.object(baseSchema);

  return schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true, // Loại bỏ các trường không được định nghĩa trong schema
    presence: isUpdate ? 'optional' : 'required' // Cho phép optional khi update
  });
};

module.exports = {
  validateCourse
}; 