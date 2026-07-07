 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload'; // NEW IMPORT

// ... (Keep your existing Route Imports)
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import mailRouter from './routes/mail.route.js'; 
import videoRouter from './routes/video.route.js'; 

dotenv.config();
const app = express();

// --- CORS & MIDDLEWARE ---
app.use(cors({ 
  origin: (origin, cb) => cb(null, true), // Simplified for testing; adjust for production
  credentials: true 
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// --- CRITICAL ADDITION: FILE UPLOAD MIDDLEWARE ---
// Use useTempFiles: true so cloudinary can find the file path
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// ... (Keep your Mongoose Connection Middleware exactly as it is) ...

// --- ROUTE LINKING ---
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

// ... (Keep your remaining code: Healthcheck, Error Handling, Port Binding)
export default app;