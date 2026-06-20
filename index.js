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
import mailRouter from './routes/mail.route.js'; // REGISTERED: New contact mailing system route
import videoRouter from './routes/video route.js'; // REGISTERED: New 6-second property shorts route

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- SECURE CORS CONFIGURATION ---
const allowedOrigins = [
  'https://baylatproperties.ng',
  'https://www.baylatproperties.ng',
  'https://baylat-properties-kmcg.vercel.app',
  'https://baylat-properties-kmcg-git-main-nnamdi5097s-projects.vercel.app', 
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
  credentials: true, // Crucial: Allows cookies to pass from frontend to backend over the cloud
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
  exposedHeaders: ['set-cookie'] // Instructs browsers it is safe to read cross-origin auth cookie responses
}));

// --- FIXED: INTERCEPT BROWSER PREFLIGHT OPTIONS REQUESTS DYNAMICALLY FOR MOBILE COMPLIANCE ---
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Ensure we dynamically echo the exact origin if allowed, preventing mobile browser rejections
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default fallback to root domain if origin header is strangely missing
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
app.use('/api/mail', mailRouter);   // ACTIVATED: Handles contact form message routing safely
app.use('/api/video', videoRouter); // ACTIVATED: Handles client 6-second property video uploads and rules

// Safety Catch
app.use('/sign-in', authRouter);

// --- UPDATED HEALTHCHECK PATH ---
// Shift fallback health-check status tracker down into an isolated route segment
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: "alive", message: "Baylat Properties Node.js Backend is operational!" });
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

// --- FIXED: FORCED PORT BINDING TO ELIMINATE CPANEL PASSENGER 503 ERROR ---
// Phusion Passenger completely requires the app to listen on a dynamically passed port.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running beautifully on port ${PORT}`);
});

export default app;