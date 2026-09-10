const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/profile', complianceController.getProfile);
router.post('/profile', complianceController.saveProfile);
router.get('/checklist', complianceController.getChecklist);
router.get('/roadmap', complianceController.getRoadmap);
router.get('/approval-detail/:id', complianceController.getApprovalDetail);
router.get('/schemes', complianceController.getSchemes);
router.get('/licences', complianceController.getLicences);

module.exports = router;
