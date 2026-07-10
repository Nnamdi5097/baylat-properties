 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Adjust these paths based on where your 'routes' folder is now
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import mailRouter from './routes/mail.route.js'; 
import videoRouter from './routes/video.route.js'; 

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://baylatproperties.ng', 
  'https://www.baylatproperties.ng',
  'https://baylat-properties.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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

// Simple DB connection helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Routes
app.get('/api', (req, res) => res.status(200).json({ message: 'Server is running!' }));
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/mail', mailRouter);    
app.use('/api/video', videoRouter); 

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ success: false, statusCode, message: err.message });
});

export default app;