 import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,                      // True on Vercel (HTTPS), false locally (HTTP)
  sameSite: isProduction ? 'none' : 'lax',    // 'none' for Vercel cross-site, 'lax' for local dev
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res, next) => {
  console.log("DEBUG: Signup started with body:", { email: req.body?.email, username: req.body?.username });
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(errorHandler(400, 'All fields are required!'));
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log("DEBUG: User created successfully");
    return res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    console.error("DEBUG: Signup error exception:", error);
    next(error);
  }
};

export const signin = async (req, res, next) => {
  console.log("DEBUG: Signin function started");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(errorHandler(400, 'Email and password are required!'));
    }

    console.log("DEBUG: Attempting to find user:", email);
    const validUser = await User.findOne({ email });
    if (!validUser) {
      console.log("DEBUG: User not found in database");
      return next(errorHandler(404, 'User not found!'));
    }

    console.log("DEBUG: User found, verifying password");
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      console.log("DEBUG: Wrong credentials provided");
      return next(errorHandler(401, 'Wrong credentials!'));
    }

    if (!process.env.JWT_SECRET) {
      console.error("DEBUG CRITICAL: JWT_SECRET environment variable is missing!");
      return next(errorHandler(500, 'Server configuration error: JWT secret missing'));
    }

    console.log("DEBUG: Password valid, generating token");
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin || false }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const { password: pass, ...rest } = validUser._doc;

    console.log("DEBUG: Login successful, sending response");
    return res.cookie('access_token', token, cookieOptions)
      .status(200)
      .json(rest);
  } catch (error) {
    console.error("DEBUG: Signin exception error:", error);
    next(error);
  }
};

export const google = async (req, res, next) => {
  console.log("DEBUG: Google auth started");
  try {
    if (!process.env.JWT_SECRET) {
      console.log("DEBUG CRITICAL: JWT_SECRET environment variable is missing!");
      return next(errorHandler(500, 'Server configuration error: JWT secret missing'));
    }

    const user = await User.findOne({ email: req.body.email });
    
    if (user) {
      console.log("DEBUG: Existing Google user found");
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin || false }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      const { password: pass, ...rest } = user._doc;

      return res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    } else {
      console.log("DEBUG: Creating new Google user");
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      const baseName = req.body.name ? req.body.name.split(' ').join('').toLowerCase() : 'user';
      
      const newUser = new User({
        username: baseName + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin || false }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      const { password: pass, ...rest } = newUser._doc;

      return res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.error("DEBUG: Google auth error exception:", error);
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    console.log("DEBUG: Signing out user");
    res.clearCookie('access_token', { ...cookieOptions });
    return res.status(200).json({ success:  true, message: 'User has been logged out successfully!' });
  } catch (error) {
    console.error("DEBUG: Signout error exception:", error);
    next(error);
  }
};