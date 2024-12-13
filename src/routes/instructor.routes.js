const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorAuthMiddleware = require('../middlewares/instructorAuth.middleware');

// Debug middleware
router.use((req, res, next) => {
  console.log('Route accessed:', req.method, req.path);
  next();
});

// Profile route - Định nghĩa route một cách rõ ràng hơn
router.get('/profile', authMiddleware, instructorAuthMiddleware, (req, res, next) => {
  console.log('Profile route hit, calling controller');
  instructorController.getCurrentInstructor(req, res, next);
});

// Các routes khác
router.get('/', authMiddleware, instructorAuthMiddleware, async (req, res, next) => {
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

// Achievement routes
router.get('/:instructor_id/achievements', async (req, res, next) => {
  try {
    const achievements = await instructorController.getAchievements(req.params.instructor_id);
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructor_id/achievements', async (req, res, next) => {
  try {
    const achievement = await instructorController.createAchievement(req.params.instructor_id, req.body);
    res.status(201).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:instructor_id/achievements/:achievementId', async (req, res, next) => {
  try {
    const achievement = await instructorController.updateAchievement(
      req.params.instructor_id,
      req.params.achievementId,
      req.body
    );
    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:instructor_id/achievements/:achievementId', async (req, res, next) => {
  try {
    await instructorController.deleteAchievement(
      req.params.instructor_id,
      req.params.achievementId
    );
    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Certificate routes
router.get('/:instructor_id/certificates', async (req, res, next) => {
  try {
    const certificates = await instructorController.getCertificates(req.params.instructor_id);
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructor_id/certificates', async (req, res, next) => {
  try {
    const certificate = await instructorController.createCertificate(req.params.instructor_id, req.body);
    res.status(201).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:instructor_id/certificates/:certificateId', async (req, res, next) => {
  try {
    const certificate = await instructorController.updateCertificate(
      req.params.instructor_id,
      req.params.certificateId,
      req.body
    );
    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:instructor_id/certificates/:certificateId', async (req, res, next) => {
  try {
    await instructorController.deleteCertificate(
      req.params.instructor_id,
      req.params.certificateId
    );
    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Work History routes
router.get('/:instructor_id/work-history', async (req, res, next) => {
  try {
    const workHistory = await instructorController.getWorkHistory(req.params.instructor_id);
    res.json({
      success: true,
      data: workHistory
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:instructor_id/work-history', async (req, res, next) => {
  try {
    const workHistory = await instructorController.createWorkHistory(req.params.instructor_id, req.body);
    res.status(201).json({
      success: true,
      data: workHistory
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:instructor_id/work-history/:historyId', async (req, res, next) => {
  try {
    const workHistory = await instructorController.updateWorkHistory(
      req.params.instructor_id,
      req.params.historyId,
      req.body
    );
    res.json({
      success: true,
      data: workHistory
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:instructor_id/work-history/:historyId', async (req, res, next) => {
  try {
    await instructorController.deleteWorkHistory(
      req.params.instructor_id,
      req.params.historyId
    );
    res.json({
      success: true,
      message: 'Work history deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, instructorAuthMiddleware, (req, res, next) => {
  instructorController.updateInstructor(req, res, next);
});

module.exports = router; 