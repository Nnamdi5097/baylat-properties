 import express from 'express';
import Video from '../models/video.js'; 
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js'; 
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';

const router = express.Router();

// Configure multer to store files in memory for Vercel serverless compatibility
const upload = multer({ storage: multer.memoryStorage()  });

// ==========================================
// 1. GET ALL VIDEOS (Public access)
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("DEBUG: Fetch videos error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos.',  error: error.message });
  }
});

// ==========================================
// 2. UPLOAD A NEW VIDEO (Admin only)
// ==========================================
router.post('/upload', verifyToken, verifyAdmin, upload.single('video'), async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached (6 videos). Please delete an old video first.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided.' });
    }

    // Convert memory buffer to a data URI string for Cloudinary upload
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      resource_type: "video", 
      folder: "baylat_properties"
    });

    const newVideo = new Video({
      title: req.body.title,
      videoUrl: result.secure_url,
      publicId: result.public_id,
    });

    await newVideo.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Property video uploaded successfully!', 
      video: newVideo 
    });
  } catch (error) {
    console.error("DEBUG: Upload error:", error);
    return res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
  }
});

// ==========================================
// 3. DELETE A VIDEO (Admin only)
// ==========================================
router.delete('/delete/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });

    // Remove from Database
    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Video deleted successfully.' });
  } catch (error) {
    console.error("DEBUG: Delete error:", error);
    res.status(500).json({ success: false, message: 'Delete failed.', error: error.message });
  }
});

export default router;