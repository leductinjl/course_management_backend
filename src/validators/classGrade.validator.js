const Joi = require('joi');

const classGradeSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  grades: Joi.array().items(
    Joi.object({
      enrollment_id: Joi.string().uuid().required(),
      attendance_score: Joi.number().min(0).max(100),
      midterm_score: Joi.number().min(0).max(10),
      final_score: Joi.number().min(0).max(10)
    })
  )
});

const validateClassGrades = (data) => {
  return classGradeSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateClassGrades
};
