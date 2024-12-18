const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/student.grade.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');

router.use(authMiddleware);
router.use(studentAuthMiddleware);

router.get('/my-grades', studentGradeController.getMyGrades);

module.exports = router; 