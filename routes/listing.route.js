import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';


const router = express.Router();

// ✅ These are the correct routes that your properties page needs to talk to!
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing); // 🎯 This is what loads the single property page details!
router.get('/get', getListings);     // 🎯 This is what displays all properties on the main page!

export default router;
