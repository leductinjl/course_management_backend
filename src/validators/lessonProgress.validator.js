const Joi = require('joi');

const lessonProgressSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  lesson_number: Joi.number().integer().min(1).required(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  completed: Joi.boolean(),
  completion_date: Joi.date().allow(null),
  notes: Joi.string().allow('', null)
});

const validateLessonProgress = (data) => {
  return lessonProgressSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateLessonProgress
}; 