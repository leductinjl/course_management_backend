const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', courseController.getCourses);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

router.get('/available', async (req, res, next) => {
  try {
    const courses = await courseController.getAvailableCourses();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 