const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin.routes');
const instructorRoutes = require('./instructor.routes');
const instructorTeachingRoutes = require('./instructor.teaching.routes');
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const enrollmentRoutes = require('./enrollment.routes');
const lessonProgressRoutes = require('./lessonProgress.routes');
const classRoutes = require('./class.routes');
const classRequestRoutes = require('./classRequest.routes');
const studentGradeRoutes = require('./student.grade.routes');

router.use('/api/auth', authRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/instructor', instructorRoutes);
router.use('/api/instructor/teaching', instructorTeachingRoutes);
router.use('/api/instructor/class-requests', classRequestRoutes);
router.use('/api/student', studentRoutes);
router.use('/api/student/enrollments', enrollmentRoutes);
router.use('/api/class', classRoutes);
router.use('/api/lesson-progress', lessonProgressRoutes);
router.use('/api/student/grades', studentGradeRoutes);

module.exports = router; 