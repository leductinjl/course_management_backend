const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const courseController = require('../controllers/course.controller');
const classController = require('../controllers/class.controller');
const scheduleController = require('../controllers/schedule.controller');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');
const { Student } = require('../models');
const { ApiError } = require('../utils/apiError');

router.use(studentAuthMiddleware);

router.get('/profile', studentController.getCurrentStudent);
router.put('/:id', studentController.updateStudent);

router.get('/schedule', scheduleController.getStudentSchedule);

router.get('/classes/available/:course_id', async (req, res, next) => {
  try {
    const classes = await classController.getAvailableClassesForStudent(
      req.params.course_id,
      req.user.id
    );
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/available', async (req, res, next) => {
  try {
    const courses = await courseController.getStudentAvailableCourses();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/enrolled', async (req, res, next) => {
  try {
    // Lấy student_id từ user_id trong token
    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });

    if (!student) {
      throw new ApiError(404, 'Không tìm thấy thông tin học viên');
    }

    const enrolledCourses = await studentController.getEnrolledCourses(student.id);
    
    res.json({
      success: true,
      data: enrolledCourses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 