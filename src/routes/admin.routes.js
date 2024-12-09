const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const userManagementController = require('../controllers/user.controller');
const adminActivityController = require('../controllers/activity.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const courseController = require('../controllers/course.controller');
const classController = require('../controllers/class.controller');

// Auth routes
router.post('/auth/login', adminController.login);
router.post('/auth/logout', authMiddleware, adminController.logout);
router.get('/profile', authMiddleware, adminController.getProfile);
router.put('/profile', authMiddleware, adminController.updateProfile);

// Activity routes
router.get('/activities', authMiddleware, adminActivityController.getActivities);

// User management routes
router.get('/users', authMiddleware, userManagementController.listUsers);
router.post('/users', authMiddleware, userManagementController.createUser);
router.put('/users/:id', authMiddleware, userManagementController.updateUser);
router.delete('/users/:id', authMiddleware, userManagementController.deleteUser);

// Course management routes
router.get('/courses/available', authMiddleware, courseController.getAvailableCourses);
router.get('/courses', authMiddleware, courseController.listCourses);
router.post('/courses', authMiddleware, courseController.createCourse);
router.get('/courses/:id', authMiddleware, courseController.getCourse);
router.put('/courses/:id', authMiddleware, courseController.updateCourse);
router.delete('/courses/:id', authMiddleware, courseController.deleteCourse);

// Class management routes
// Đặt các routes cụ thể trước
router.get('/classes/instructors', authMiddleware, classController.getInstructors);
router.get('/classes/available-courses', authMiddleware, classController.getAvailableCourses);
router.get('/classes/stats/summary', authMiddleware, classController.getClassSummary);

// Sau đó là các routes có params
router.get('/classes/stats/enrollment-count/:id', authMiddleware, classController.getEnrollmentCount);
router.get('/classes/stats/lesson-progress/:id', authMiddleware, classController.getLessonProgress);
router.get('/classes/stats/announcement-count/:id', authMiddleware, classController.getAnnouncementCount);

// Cuối cùng là các routes CRUD cơ bản
router.get('/classes', authMiddleware, classController.listClasses);
router.post('/classes', authMiddleware, classController.createClass);
router.get('/classes/:id', authMiddleware, classController.getClass);
router.put('/classes/:id', authMiddleware, classController.updateClass);
router.delete('/classes/:id', authMiddleware, classController.deleteClass);

module.exports = router; 