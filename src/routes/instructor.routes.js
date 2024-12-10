const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

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

// GET /api/instructors/me - Get current instructor profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    console.log('User in request:', req.user);
    const instructor = await instructorController.getCurrentInstructor(req.user.userId);
    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
});

// Achievement routes
router.get('/:instructorId/achievements', async (req, res, next) => {
  try {
    const achievements = await instructorController.getAchievements(req.params.instructorId);
    res.json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructorId/achievements', authMiddleware, async (req, res, next) => {
  try {
    const achievement = await instructorController.createAchievement(req.params.instructorId, req.body);
    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    next(error);
  }
});

// Certificate routes
router.get('/:instructorId/certificates', async (req, res, next) => {
  try {
    const certificates = await instructorController.getCertificates(req.params.instructorId);
    res.json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructorId/certificates', authMiddleware, async (req, res, next) => {
  try {
    const certificate = await instructorController.createCertificate(req.params.instructorId, req.body);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
});

// Work History routes
router.get('/:instructorId/work-history', async (req, res, next) => {
  try {
    const workHistory = await instructorController.getWorkHistory(req.params.instructorId);
    res.json({ success: true, data: workHistory });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructorId/work-history', authMiddleware, async (req, res, next) => {
  try {
    const workHistory = await instructorController.createWorkHistory(req.params.instructorId, req.body);
    res.status(201).json({ success: true, data: workHistory });
  } catch (error) {
    next(error);
  }
});

// Thêm route PUT cho việc cập nhật instructor
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const instructor = await instructorController.updateInstructor(req.params.id, req.body);
    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 