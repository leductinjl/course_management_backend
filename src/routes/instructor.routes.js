const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');

// GET /api/instructors
router.get('/', async (req, res, next) => {
  try {
    const instructors = await instructorController.listInstructors();
    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 