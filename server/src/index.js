const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, getFallbackData, saveFallbackData } = require('./config/db');
const { authenticateToken } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const officerRoutes = require('./routes/officerRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents
app.use('/uploads', express.static(UPLOADS_DIR));

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Intelligent Business Approval, Licensing & Compliance Management Platform API',
    timestamp: new Date().toISOString()
  });
});

// Notifications API
app.get('/api/notifications', authenticateToken, (req, res) => {
  const data = getFallbackData();
  const notes = data.notifications
    .filter(n => n.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, notifications: notes });
});

app.post('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const data = getFallbackData();
  const note = data.notifications.find(n => n.id === noteId && n.user_id === req.user.id);
  if (note) {
    note.is_read = true;
    saveFallbackData();
  }
  res.json({ success: true });
});

// Mount Feature Modules
app.use('/api/auth', authRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Intelligent GovCompliance API Server running on port ${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
