 import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";

import userRouter from "../routes/user.route.js";
import authRouter from "../routes/auth.route.js";
import listingRouter from "../routes/listing.route.js";
import mailRouter from "../routes/mail.route.js"; 
import videoRouter from "../routes/video.route.js"; 
import User from "../models/user.model.js"; // Imported for the temporary admin bypass

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://baylatproperties.ng",
  "https://www.baylatproperties.ng",
  "https://baylat-properties.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.endsWith('.baylatproperties.ng') || 
      origin.endsWith('.vercel.app')
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser()); 

app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace("/api/api/", "/api/");
  }
  next();
});

const upload = multer({ storage: multer.memoryStorage() });

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, serverSelectionTimeoutMS: 10000 };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB");
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

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err);
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.get("/", (req, res) => res.status(200).json({ message: "Baylat Properties API is working successfully!" }));

// ==========================================
// TEMPORARY ADMIN BYPASS ROUTE
// ==========================================
app.get("/api/auth/make-me-admin", async (req, res) => {
  try {
    const email = "BaylatProperties79@gmail.com";
    
    // Find user or create if not present with hashed/temp password placeholder
    let user = await User.findOne({ email });
    
    if (user) {
      user.isAdmin = true;
      if (user.role !== undefined) user.role = "admin";
      await user.save();
    } else {
      // If user document doesn't exist yet, create it
      user = await User.create({
        username: "BaylatAdmin",
        email: email,
        password: "$2a$10$TemporaryBypassPasswordHashPlaceholderToAvoidValidationErrors", // Will require real sign up if auth checks password strictly, but sets flag
        isAdmin: true,
        role: "admin"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Success! Account updated to admin.",
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/mail", mailRouter);    
app.use("/api/video", videoRouter); 

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`ERROR intercepted [${statusCode}]:`, message, err);
  return res.status(statusCode).json({ success: false, statusCode, message });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;