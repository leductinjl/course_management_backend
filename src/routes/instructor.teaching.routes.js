const express = require('express');
const router = express.Router();
const instructorTeachingController = require('../controllers/instructor.teaching.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorAuthMiddleware = require('../middlewares/instructorAuth.middleware');

// Use middleware functions directly
router.use(authMiddleware);
router.use(instructorAuthMiddleware);

// Teaching schedule routes
router.get('/schedule', instructorTeachingController.getTeachingSchedule);
router.get('/courses', instructorTeachingController.getInstructorCourses);
router.patch('/classes/:classId/status', instructorTeachingController.updateClassStatus);

module.exports = router;
