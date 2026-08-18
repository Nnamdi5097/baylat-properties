 import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(errorHandler(400, 'All fields are required!'));
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(errorHandler(400, 'Email and password are required!'));
    }

    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found!'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, 'Wrong credentials!'));
    }

    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, 'Server configuration error: JWT secret missing'));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin || false }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const { password: pass, ...rest } = validUser._doc;

    // ✨ Include token in JSON response so frontend localStorage captures it properly
    return res.cookie('access_token', token, cookieOptions)
      .status(200)
      .json({ ...rest, token });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, 'Server configuration error: JWT secret missing'));
    }

    let user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const baseName = req.body.name ? req.body.name.split(' ').join('').toLowerCase() : 'user';
      
      user = new User({
        username: baseName + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin || false }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const { password: pass, ...rest } = user._doc;

    return res.cookie('access_token', token, cookieOptions)
      .status(200)
      .json({ ...rest, token });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', { ...cookieOptions });
    return res.status(200).json({ success: true, message: 'User has been logged out successfully!' });
  } catch (error) {
    next(error);
  }
};

