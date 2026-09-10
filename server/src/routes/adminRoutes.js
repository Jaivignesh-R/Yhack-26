const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/overview', adminController.getAdminOverview);
router.post('/departments', adminController.saveDepartment);
router.post('/approval-types', adminController.saveApprovalType);
router.post('/rules', adminController.saveRule);
router.delete('/rules/:id', adminController.deleteRule);
router.post('/dependencies', adminController.saveDependency);
router.delete('/dependencies/:id', adminController.deleteDependency);
router.post('/document-requirements', adminController.saveDocumentRequirement);
router.get('/analytics', adminController.getPlatformAnalytics);

module.exports = router;
