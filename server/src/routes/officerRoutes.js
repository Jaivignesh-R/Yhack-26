const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['officer', 'admin']));

router.get('/applications', officerController.getAssignedApplications);
router.post('/applications/:id/action', officerController.processApplicationAction);
router.post('/applications/:id/schedule-inspection', officerController.scheduleInspection);
router.post('/inspections/:id/report', officerController.submitInspectionReport);
router.get('/analytics', officerController.getDepartmentAnalytics);

module.exports = router;
