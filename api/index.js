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

// --- ALLOWED ORIGINS ---
// Ensure this list includes the actual URL where your FRONTEND is deployed
const allowedOrigins = [
  'https://baylatproperties.ng', 
  'https://www.baylatproperties.ng',
  'https://baylat-properties.vercel.app' // Added this crucial domain
];

// --- CONSOLIDATED CORS SETUP ---
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not defined");
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error("DB CONNECTION FAILED:", err.message);
    throw err;
  }
};

// --- DATABASE MIDDLEWARE ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// --- ROUTES ---
app.get('/', (req, res) => res.status(200).json({ success: true, message: 'Server is running!' }));
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ 
    success: false, 
    statusCode, 
    message: err.message || 'Internal Server Error' 
  });
});

export default app;