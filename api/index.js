 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import userRouter from '../routes/user.route.js';
import authRouter from '../routes/auth.route.js';
import listingRouter from '../routes/listing.route.js';
import mailRouter from '../routes/mail.route.js'; 
import videoRouter from '../routes/video.route.js'; 

dotenv.config();

const app = express();

// --- DATABASE CONNECTION (Optimized for Serverless) ---
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// --- CORS & MIDDLEWARE ---
const corsOptions = { 
  origin: ['https://baylatproperties.ng'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// --- ROUTE MIDDLEWARE (Ensures DB is connected before processing) ---
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running!' });
});

// --- ROUTE LINKING ---
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({ success: false, statusCode, message });
});

export default app;