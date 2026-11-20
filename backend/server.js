const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/activities', require('./routes/activities'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React build in production
/*const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));
// Explicit route for password reset links
app.get('/resetpassword/:token', (req, res) => {
  // Serve the SPA entry point so React can handle the token
  res.sendFile(path.join(buildPath, 'index.html'));
});

// SPA catch-all: serve index.html for any non-API route
// This makes direct URL navigation (e.g. password reset links in emails) work
app.get(/^\/(?!api)., (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});*/
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CRM Backend API Running'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Connect DB & start
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, '0.0.0.0', () =>
      console.log(`Server running on http://0.0.0.0:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => { console.error(err); process.exit(1); });
