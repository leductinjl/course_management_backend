const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');

router.use(studentAuthMiddleware);

router.post('/enroll', enrollmentController.enrollClass);
router.post('/unenroll/:class_id', enrollmentController.unenrollClass);
router.get('/my-enrollments', enrollmentController.getMyEnrollments);
router.get('/history', enrollmentController.getEnrollmentHistory);

module.exports = router; 