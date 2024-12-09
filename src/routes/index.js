const express = require('express');
const adminRoutes = require('./admin.routes');
const instructorRoutes = require('./instructor.routes');
const authRoutes = require('./auth.routes');


const router = express.Router();

router.use('/api/admin', adminRoutes);
router.use('/api/instructors', instructorRoutes);
router.use('/api/auth', authRoutes);
module.exports = router; 