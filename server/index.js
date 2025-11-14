// server/index.js (Add plans routes)
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors())

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routers/authRouter'));
app.use('/api/dashboard', require('./routers/dashboardRouter'));
app.use('/api/predictions', require('./routers/predictionsRouter'));
app.use('/api/fields', require('./routers/fieldsRouter'));
app.use('/api/plans', require('./routers/plansRouter')); // NEW
app.use('/api/tasks', require('./routers/tasksRouter'));
app.use('/api/alerts', require('./routers/alertsRouter'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});