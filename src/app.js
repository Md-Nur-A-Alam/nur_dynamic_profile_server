require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const getAuth = require('./config/betterAuth');


const app = express();

// Security and Logging Middlewares
app.use(helmet());
app.use(morgan('dev'));

// CORS config (allow client app)
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_BASE_URL, 
      'http://localhost:3000',
      'https://nur-dynamic-profile-client-beta.vercel.app'
    ].filter(Boolean);
    
    // Allow if origin is in the list, or if it's a vercel preview deployment
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, origin || true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { ADMIN_EMAILS } = require('./config/constants');

// Prevent admin emails from registering via the public email/password path
app.post('/api/auth/sign-up/email', (req, res, next) => {
  const email = req.body?.email;
  if (email && ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ message: "Admin accounts cannot be created via public registration." });
  }
  next();
});

// Better Auth Route Handler (must be bound before other routes that might conflict)
app.use("/api/auth", async (req, res, next) => {
  try {
    const { toNodeHandler } = await import('better-auth/node');
    const auth = await getAuth();
    return toNodeHandler(auth)(req, res, next);
  } catch (err) {
    next(err);
  }
});

const portfolioRoutes = require('./routes/portfolioRoutes');
const socialRoutes = require('./routes/socialRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Rate limiting disabled for now

// App Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/upload', uploadRoutes);

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
