const express = require('express');
const router = express.Router();
const lessonProgressController = require('../controllers/lessonProgress.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorAuthMiddleware = require('../middlewares/instructorAuth.middleware');

router.use(authMiddleware);

// Routes cho instructor
router.post('/', instructorAuthMiddleware, lessonProgressController.createLesson);
router.put('/:id', instructorAuthMiddleware, lessonProgressController.updateLesson);
router.get('/class/:class_id', lessonProgressController.getClassLessons);
router.get('/stats/:class_id', lessonProgressController.getLessonStats);

module.exports = router; 