require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Initialize database connection for serverless function
connectDB().catch(console.error);

// Export the express app for Vercel to use as a serverless function
module.exports = app;