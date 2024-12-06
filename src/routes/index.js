const express = require('express');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/api/admin', adminRoutes);

module.exports = router; 