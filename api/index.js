 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*', 
  credentials: true
}));

// Connect to MongoDB Atlas (Looks for environment variables first, falls back to raw string safely)
const mongoURI = process.env.MONGO_URI || process.env.MONGO || "mongodb+srv://christutu5097_db_user:1eoGY4UmqG5qVaN9@baylat.ymmpknl.mongodb.net/?retryWrites=true&w=majority&appName=baylat";

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });

// --- ROUTE IMPORTS ---
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';

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
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Only start listening on a port if we aren't running in a Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
  });
}

// Export app for Vercel
export default app;