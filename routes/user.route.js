 import express from 'express';
import { deleteUser, test, updateUser, getUserListings, getUser } from '../controllers/user.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.post('/update/:id',  verifyToken, updateUser);

// Protect delete and user management routes to ensure only admins or authorized users can perform them
// If you want ONLY admins to delete users, chain verifyAdmin:
router.delete('/delete/:id', verifyToken, verifyAdmin, deleteUser);

router.get('/listings/:id', verifyToken, getUserListings);
router.get('/:id', verifyToken,  getUser);

export default router;