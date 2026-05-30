import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // 1. Look for the token in the cookies OR the Authorization Header fallback
  const token = req.cookies?.access_token || req.headers['authorization']?.split(' ')[1];

  // 2. If no token is found on either channel, block unauthorized access smoothly
  if (!token) {
    return next(errorHandler(401, 'Unauthorized: Access token missing'));
  }

  // 3. Verify the token signature securely
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(403, 'Forbidden: Token is invalid or expired'));
    }

    // 4. Attach decoded payload to the request context
    req.user = user;
    next();
  });
};
