 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Route Imports
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import mailRouter from './routes/mail.route.js'; 
import videoRouter from './routes/video.route.js'; 

dotenv.config();

// Connect to MongoDB (Ensure MONGO_URI is in Vercel Settings!)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const app = express();

// --- CORS & MIDDLEWARE ---
// Explicitly allow your frontend domain to prevent the CORS error
app.use(cors({ 
  origin: ['https://baylatproperties.ng'], 
  credentials: true 
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// File Upload Middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// --- ROUTE LINKING ---
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// Error Handling Middleware (Helps catch 500 errors)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;