const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-vercel-app-url.vercel.app' // Replace with your actual Vercel URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// Error Handler
app.use(errorHandler);

module.exports = app;
