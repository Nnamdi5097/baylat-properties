 import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // Define trusted domains exactly matching your index.js infrastructure
  const allowedOrigins = [
    'https://baylatproperties.ng',
    'https://www.baylatproperties.ng',
    'https://baylat-properties-kmcg.vercel.app',
    'https://baylat-properties-kmcg-git-main-nnamdi5097s-projects.vercel.app', 
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;

  // Function to safely inject cross-origin headers if an error occurs early
  const injectCorsHeaders = () => {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://baylatproperties.ng');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  };

  // 1. Look for the token in cookies, or fall back to the Authorization Header
  const token = req.cookies?.access_token || req.headers['authorization']?.split(' ')[1];

  // 2. If no token is found on either channel, block unauthorized access smoothly
  if (!token) {
    injectCorsHeaders(); // Ensure browser receives CORS allowance headers on failure
    return next(errorHandler(401, 'Unauthorized: Access token missing'));
  }

  // 3. Verify the token signature securely
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      injectCorsHeaders(); // Ensure browser receives CORS allowance headers on failure
      return next(errorHandler(403, 'Forbidden: Token is invalid or expired'));
    }

    // 4. Attach decoded payload to the request context
    req.user = user;
    next();
  });
};