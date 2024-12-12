const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin.routes');
const instructorRoutes = require('./instructor.routes');
const instructorTeachingRoutes = require('./instructor.teaching.routes');
const authRoutes = require('./auth.routes');

// Admin routes with /api/admin prefix
router.use('/api/admin', adminRoutes);

// Instructor routes with /api/instructor prefix
// Make sure these don't use admin middleware
router.use('/api/instructor', instructorRoutes);
router.use('/api/instructor/teaching', instructorTeachingRoutes);

// Auth routes
router.use('/api/auth', authRoutes);

module.exports = router; 