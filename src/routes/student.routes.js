const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const courseController = require('../controllers/course.controller');
const classController = require('../controllers/class.controller');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');

router.use(studentAuthMiddleware);

router.get('/profile', studentAuthMiddleware, studentController.getCurrentStudent);
router.put('/:id', studentAuthMiddleware, studentController.updateStudent);

// Thêm route mới cho lấy danh sách lớp học khả dụng
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

module.exports = router; 