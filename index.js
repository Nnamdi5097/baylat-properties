 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// --- ALL ROUTE IMPORTS HOISTED CLEANLY AT THE TOP ---
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- SECURE CORS CONFIGURATION ---
const allowedOrigins = [
  'https://baylatproperties.ng',
  'https://www.baylatproperties.ng',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie']
}));

// Intercept browser preflight OPTIONS requests immediately
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie');
  return res.sendStatus(204);
});

// --- CORE MIDDLEWARE (Guaranteed to execute before routes) ---
app.use(express.json());
app.use(cookieParser()); 

// --- SERVERLESS MONGOOSE CONNECTION CACHE ---
const mongoURI = process.env.MONGO_URI || process.env.MONGO || "mongodb+srv://christutu5097_db_user:1eoGY4UmqG5qVaN9@baylat.ymmpknl.mongodb.net/?retryWrites=true&w=majority&appName=baylat";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Global middleware to guarantee database connectivity
app.use(async (req, res, next) => {
  try {
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);

    if (cached.conn) {
      return next();
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000, 
      };

      cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
        console.log('New MongoDB connection established successfully!');
        return mongooseInstance;
      });
    }

    cached.conn = await cached.promise;
    next();
  } catch (error) {
    console.error('MongoDB Serverless Connection Error:', error);
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return res.status(500).json({
      success: false,
      message: "Database connection failed under heavy serverless traffic.",
      error: error.message
    });
  }
});

// --- ROUTE LINKING ---
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Safety Catch
app.use('/sign-in', authRouter);

// Fallback test route
app.all('/', (req, res) => {
  res.status(200).json({ message: "Baylat Properties Backend is Live on Vercel!" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
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

// Start server locally if not in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
  });
}

export default app;   