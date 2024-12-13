const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin.routes');
const instructorRoutes = require('./instructor.routes');
const instructorTeachingRoutes = require('./instructor.teaching.routes');
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const enrollmentRoutes = require('./enrollment.routes');

router.use('/api/admin', adminRoutes);


router.use('/api/instructor', instructorRoutes);
router.use('/api/instructor/teaching', instructorTeachingRoutes);

router.use('/api/student', studentRoutes);
router.use('/api/student/enrollments', enrollmentRoutes);


router.use('/api/auth', authRoutes);

module.exports = router; 