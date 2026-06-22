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
import mailRouter from './routes/mail.route.js'; 
import videoRouter from './routes/video.route.js'; 

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- SECURE CORS CONFIGURATION (Updated to Active Live Deployments) ---
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
    
    if (allowedOrigins.indexOf(origin) !== -1) {
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
  optionsSuccessStatus: 204 // Handshakes respond beautifully across domains
};

// Apply CORS configurations globally
app.use(cors(corsOptions));

// --- ⚡ FIXED: INTERCEPT BROWSER PREFLIGHT OPTIONS AUTOMATICALLY WITH CORS MIDDLEWARE ---
app.options('*', cors(corsOptions));

// --- CORE MIDDLEWARE WITH ENHANCED SIZE LIMITS ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// --- SERVERLESS MONGOOSE CONNECTION CACHE ---
const mongoURI = process.env.MONGO_URI || process.env.MONGO || "mongodb+srv://christutu5097_db_user:1eoGY4UmqG5qVaN9@baylat.ymmpknl.mongodb.net/?retryWrites=true&w=majority&appName=baylat";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

app.use(async (req, res, next) => {
  try {
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);

    if (cached.conn) {
      return next();
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(mongoURI).then((mongooseInstance) => {
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

// --- SERVERLESS OPTIMIZED PORT BINDING ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
  });
}

export default app;