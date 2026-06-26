 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// --- ALL ROUTE IMPORTS HOISTED CLEANLY AT THE TOP ---
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import mailRouter from './routes/mail.route.js'; 
import videoRouter from './routes/video.route.js'; 

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- SECURE CORS CONFIGURATION ---
const allowedOrigins = [
  'https://baylatproperties.ng',
  'https://www.baylatproperties.ng',
  'https://baylat-properties.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow explicitly matching origins OR any preview deployment domain ending with .vercel.app
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 204 
};

// Apply CORS configurations globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- CORE MIDDLEWARE WITH ENHANCED SIZE LIMITS ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// --- ⚡ FIXED: SINGLETON SERVERLESS MONGOOSE CONNECTION CACHE ---
let connectionPromise = null; // Track the connection attempt, not just the active state

app.use(async (req, res, next) => {
  // If connection state is already active (1), bypass immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Ensure environment variables are strictly used for security
  const mongoURI = process.env.MONGO || process.env.MONGO_URI;
  if (!mongoURI) {
    return res.status(500).json({ success: false, message: "Server configuration missing database credentials." });
  }

  // If a connection is not already in progress, start one and save the promise
  if (!connectionPromise) {
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);

    connectionPromise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, 
      maxPoolSize: 10, // Optimize for multiple simultaneous Vercel requests
    }).then(() => {
      console.log('🚀 MongoDB connected successfully in serverless environment');
    }).catch((error) => {
      connectionPromise = null; // Reset on failure so the next request can try again
      console.error('MongoDB Serverless Connection Error:', error);
      throw error;
    });
  }

  try {
    // All simultaneous requests will wait for this single promise to resolve!
    await connectionPromise;
    next();
  } catch (error) {
    // Safe fallback CORS tracking setup for error pipeline
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return res.status(500).json({
      success: false,
      message: "Database connection failed or timed out under heavy serverless traffic.",
      error: error.message
    });
  }
});

// --- ROUTE LINKING ---
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// Safety Catch
app.use('/sign-in', authRouter);

// --- HEALTHCHECK PATH ---
app.all('/', (req, res) => {
  res.status(200).json({ status: "alive", message: "Baylat Properties Node.js Backend is fully operational on Vercel!" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// --- SERVERLESS OPTIMIZED PORT BINDING ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
  });
}

export default app;