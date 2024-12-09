const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateStudentRegister } = require('../validators/auth.validator');

// Student routes
router.post('/student/login', validateLogin, authController.studentLogin);
router.post('/student/register', validateStudentRegister, authController.studentRegister);

// Instructor routes
router.post('/instructor/login', validateLogin, authController.instructorLogin);

module.exports = router; 