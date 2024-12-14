const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorAuthMiddleware = require('../middlewares/instructorAuth.middleware');

router.use(authMiddleware);
router.use(instructorAuthMiddleware);

// Routes cho giảng viên
router.get('/class/:class_id', gradeController.getClassGrades);
router.post('/bulk-update', gradeController.updateGrades);
router.put('/:id', gradeController.updateGrade);
router.get('/export/:class_id', gradeController.exportGrades);
router.post('/import/:class_id', gradeController.importGrades);

// Routes cho học viên
router.get('/student/my-grades', gradeController.getMyGrades);

module.exports = router; 