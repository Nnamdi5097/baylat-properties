 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';

import userRouter from '../routes/user.route.js';
import authRouter from '../routes/auth.route.js';
import listingRouter from '../routes/listing.route.js';
import mailRouter from '../routes/mail.route.js'; 
import videoRouter from '../routes/video.route.js'; 

dotenv.config();

const app = express();

// --- 1. CORS CONFIGURATION (MUST BE FIRST) ---
const corsOptions = {
  origin: [
    'https://baylatproperties.ng', 
    'https://www.baylatproperties.ng', 
    'https://baylat-properties.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// --- 2. MIDDLEWARES ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// --- Multer Memory Storage Configuration for Vercel ---
const upload = multer({ storage: multer.memoryStorage() });

// --- 3. ROBUST DATABASE CONNECTION CACHING FOR VERCEL ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, serverSelectionTimeoutMS: 10000 };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log('Connected to MongoDB');
      return mongooseInstance;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

// Ensure database connects cleanly on incoming API execution without blocking body streams
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// --- 4. ROUTES ---
app.get('/', (req, res) => res.status(200).json({ message: 'Baylat Properties API is working successfully!' }));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`ERROR intercepted [${statusCode}]:`, message, err);
  return res.status(statusCode).json({ success: false, statusCode, message });
});

// --- 5. SERVER LISTENER (For Local Testing) ---
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;