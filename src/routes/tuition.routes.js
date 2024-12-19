const express = require('express');
const router = express.Router();
const TuitionController = require('../controllers/tuition.controller');
const validate = require('../middlewares/validate');
const tuitionValidators = require('../validators/tuition.validator');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/my-tuitions', authMiddleware, TuitionController.getStudentTuitions);
router.post(
  '/pay',
  authMiddleware,
  validate(tuitionValidators.createPayment),
  TuitionController.createPayment
);
router.post('/vnpay/create', authMiddleware, TuitionController.createVNPayPayment);
router.get('/vnpay/return', TuitionController.handleVNPayReturn);

module.exports = router; 