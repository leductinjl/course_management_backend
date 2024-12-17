const express = require('express');
const router = express.Router();
const classRequestController = require('../controllers/classRequest.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const instructorMiddleware = require('../middlewares/instructorAuth.middleware');

router.use(authMiddleware);
router.use(instructorMiddleware);

router.post('/create', classRequestController.createRequest);
router.get('/my-requests', classRequestController.getInstructorRequests);
router.put('/update/:id', classRequestController.updateRequest);
router.delete('/delete/:id', classRequestController.deleteRequest);

module.exports = router;
