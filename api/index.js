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
app.use(express.json());
app.use(cookieParser());

// --- Multer Memory Storage Configuration for Vercel ---
const upload = multer({ storage: multer.memoryStorage() });

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);
app.use('/api/video', videoRouter);

mongoose.connect(process.env.MONGO).then(() => {
  console.log('Connected to MongoDB!');
}).catch((err) => {
  console.log(err);
});

export default app;
