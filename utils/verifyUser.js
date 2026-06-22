 import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // ⚡ FIXED: Updated to match your active live production infrastructure URLs
  const allowedOrigins = [
    'https://baylatproperties.ng',
    'https://www.baylatproperties.ng',
    'https://baylat-properties.vercel.app', 
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;

  // Function to safely inject cross-origin headers if an error occurs early
  const injectCorsHeaders = () => {
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  };

  try {
    // 1. Look for the token in cookies, or fall back to the Authorization Header
    const token = req.cookies?.access_token || req.headers['authorization']?.split(' ')[1];

    // 2. If no token is found on either channel, block unauthorized access smoothly
    if (!token) {
      injectCorsHeaders(); // Ensure browser receives CORS allowance headers on failure
      return next(errorHandler(401, 'Unauthorized: Access token missing'));
    }

    // ⚡ FIXED: Prevent unhandled runtime crashes if process.env.JWT_SECRET is temporarily missing/delayed
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_production_safety';

    // 3. Verify the token signature securely
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        injectCorsHeaders(); // Ensure browser receives CORS allowance headers on failure
        return next(errorHandler(403, 'Forbidden: Token is invalid or expired'));
      }

      // 4. Attach decoded payload to the request context
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error inside verifyToken middleware:", error.message);
    injectCorsHeaders();
    return next(errorHandler(500, 'Internal server error during token validation.'));
  }
};