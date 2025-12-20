const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialise express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Piazza API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      posts: {
        create: 'POST /api/posts',
        getAll: 'GET /api/posts',
        getById: 'GET /api/posts/:id',
        byTopic: 'GET /api/posts/topic/:topic',
        expiredByTopic: 'GET /api/posts/topic/:topic/expired',
        mostActive: 'GET /api/posts/topic/:topic/most-active',
        like: 'POST /api/posts/:id/like',
        dislike: 'POST /api/posts/:id/dislike',
        comment: 'POST /api/posts/:id/comment'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`

Piazza API Server is up and running...
Environment: ${process.env.NODE_ENV || 'development'}
Port: ${PORT}
Database: MongoDB
  `);
});

module.exports = app;