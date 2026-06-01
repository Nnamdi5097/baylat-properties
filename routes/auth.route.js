 import express from 'express';
import { google, signOut, signin, signup } from '../controllers/auth.controller.js';

const router = express.Router();

// ✅ ADDED: Preflight routing handlers to make sure CORS preflight requests clear instantly
router.options("/signup", (req, res) => res.sendStatus(204));
router.options("/signin", (req, res) => res.sendStatus(204));
router.options("/google", (req, res) => res.sendStatus(204));

// Core Authentication Routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post('/google', google);
router.get('/signout', signOut);

export default router;