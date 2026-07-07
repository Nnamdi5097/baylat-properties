 import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  try {
    // 1. Look for the token in cookies
    const token = req.cookies?.access_token;

    // 2. If no token is found, return the unauthorized error
    if (!token) {
      return next(errorHandler(401, 'Unauthorized: Access token missing'));
    }

    // 3. Verify the token signature
    // Ensure JWT_SECRET is pulled directly from process.env
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is missing in environment variables!");
      return next(errorHandler(500, 'Server configuration error.'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(errorHandler(403, 'Forbidden: Token is invalid or expired'));
      }

      // 4. Attach decoded payload to the request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error inside verifyToken middleware:", error.message);
    return next(errorHandler(500, 'Internal server error during token validation.'));
  }
};