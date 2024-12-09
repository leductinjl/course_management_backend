const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');
const { authenticate } = require('../middlewares/auth.middleware');


// Routes cho mọi user đã đăng nhập
router.get('/', classController.listClasses);
router.get('/instructors', classController.getInstructors);
router.get('/available-courses', classController.getAvailableCourses);
router.get('/:id', classController.getClass);

// Routes yêu cầu quyền admin
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

// Thêm các routes tính toán thống kê
router.get('/stats/enrollment-count/:id', classController.getEnrollmentCount);
router.get('/stats/lesson-progress/:id', classController.getLessonProgress);
router.get('/stats/announcement-count/:id', classController.getAnnouncementCount);
router.get('/stats/class-summary', classController.getClassSummary);

module.exports = router; 