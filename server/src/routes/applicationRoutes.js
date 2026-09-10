const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');

// Multer storage configuration
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

router.use(authenticateToken);

router.post('/apply', applicationController.apply);
router.get('/my', applicationController.getMyApplications);
router.get('/:id', applicationController.getApplicationById);
router.post('/:id/upload', upload.single('document'), applicationController.uploadDocument);

module.exports = router;
