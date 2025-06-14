const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://ecommerce-tauty.onrender.com',
  'https://ecommerce-tauty-backend.onrender.com'
];

// Enable CORS pre-flight across all routes
app.options('*', cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// CORS middleware with enhanced logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Increase payload size limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB connection with retry logic
const connectDB = async () => {
  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
    // Retry connection after 5 seconds
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Start the database connection
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    ...err
  });
  
  res.status(500).json({
    msg: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ msg: 'Not Found' });
});

const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
