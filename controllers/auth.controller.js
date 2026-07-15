 import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: true,      // Required for sameSite: 'none'
  sameSite: 'none',  // Required for cross-site (Vercel to API)
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res, next) => {
  console.log("DEBUG: Signup started");
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    console.log("DEBUG: User created successfully");
    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    console.error("DEBUG: Signup error", error);
    next(error);
  }
};

export const signin = async (req, res, next) => {
  console.log("DEBUG: Signin function started");
  const { email, password } = req.body;
  try {
    console.log("DEBUG: Attempting to find user:", email);
    const validUser = await User.findOne({ email });
    if (!validUser) {
      console.log("DEBUG: User not found");
      return next(errorHandler(404, 'User not found!'));
    }

    console.log("DEBUG: User found, verifying password");
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      console.log("DEBUG: Wrong credentials");
      return next(errorHandler(401, 'Wrong credentials!'));
    }

    console.log("DEBUG: Password valid, generating token");
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin || false }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const { password: pass, ...rest } = validUser._doc;

    console.log("DEBUG: Login successful, sending response");
    res.cookie('access_token', token, cookieOptions)
      .status(200)
      .json(rest);
  } catch (error) {
    console.error("DEBUG: Signin error:", error);
    next(error);
  }
};

export const google = async (req, res, next) => {
  console.log("DEBUG: Google auth started");
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (user) {
      console.log("DEBUG: Existing Google user found");
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin || false }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      const { password: pass, ...rest } = user._doc;

      res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    } else {
      console.log("DEBUG: Creating new Google user");
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: req.body.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4),
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

      res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.error("DEBUG: Google auth error:", error);
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    console.log("DEBUG: Signing out");
    res.clearCookie('access_token', { ...cookieOptions });
    return res.status(200).json({ success: true, message: 'User has been logged out successfully!' });
  } catch (error) {
    console.error("DEBUG: Signout error:", error);
    next(error);
  }
};