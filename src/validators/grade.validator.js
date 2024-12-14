const Joi = require('joi');

const gradeSchema = Joi.object({
  attendance_score: Joi.number().min(0).max(100),
  midterm_score: Joi.number().min(0).max(10),
  final_score: Joi.number().min(0).max(10),
  grade_status: Joi.string().valid('pending', 'graded', 'verified')
});

const validateGrade = (data) => {
  return gradeSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validateGrade
}; 