 import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  domain: '.baylatproperties.ng', // Helps with cross-subdomain cookie sharing
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const jwtSecret = process.env.JWT_SECRET;
    // Updated: Added || false to ensure isAdmin is never undefined
    const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin || false }, jwtSecret);
    const { password: pass, ...rest } = validUser._doc;

    res.cookie('access_token', token, cookieOptions)
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const jwtSecret = process.env.JWT_SECRET;

    if (user) {
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin || false }, jwtSecret);
      const { password: pass, ...rest } = user._doc;

      res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: req.body.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin || false }, jwtSecret);
      const { password: pass, ...rest } = newUser._doc;

      res.cookie('access_token', token, cookieOptions)
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Note: When clearing a cookie that had a domain, you must use the same options
    res.clearCookie('access_token', { ...cookieOptions, maxAge: 0 });
    return res.status(200).json({ success: true, message: 'User has been logged out successfully!' });
  } catch (error) {
    next(error);
  }
};