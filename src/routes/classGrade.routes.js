const express = require('express');
const router = express.Router();
const classGradeController = require('../controllers/classGrade.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorAuthMiddleware = require('../middlewares/instructorAuth.middleware');

router.use(authMiddleware);
router.use(instructorAuthMiddleware);

router.get('/:class_id/students', classGradeController.getClassStudents);
router.post('/:class_id/bulk-update', classGradeController.updateGrades);

module.exports = router;
