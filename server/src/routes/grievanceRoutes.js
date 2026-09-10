const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', grievanceController.raiseGrievance);
router.get('/my', grievanceController.getMyGrievances);
router.get('/all', requireRole(['admin', 'officer']), grievanceController.getAllGrievances);
router.post('/:id/resolve', requireRole(['admin', 'officer']), grievanceController.resolveGrievance);

module.exports = router;
