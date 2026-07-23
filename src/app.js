require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { toNodeHandler } = require('better-auth/node');
const auth = require('./config/betterAuth');
const { generalLimiter, authLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Security and Logging Middlewares
app.use(helmet());
app.use(morgan('dev'));

// CORS config (allow client app)
app.use(cors({
  origin: process.env.CLIENT_BASE_URL,
  credentials: true,
}));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better Auth Route Handler (must be bound before other routes that might conflict)
app.use("/api/auth", authLimiter, toNodeHandler(auth));

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// Setup generic test route
app.get('/', (req, res) => {
  res.send('Nur Dynamic Profile API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
