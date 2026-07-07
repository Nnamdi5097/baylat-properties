 import express from 'express';
import Video from '../models/video.js'; 
import { verifyToken } from '../utils/verifyUser.js'; 
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// ==========================================
// 1. GET ALL VIDEOS (Fixed 404 Issue)
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch videos.' });
  }
});

// ==========================================
// 2. UPLOAD A NEW VIDEO
// ==========================================
router.post('/upload', verifyToken, async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached (6 videos). Please delete an old video first.' 
      });
    }

    const file = req.files?.video; 
    if (!file) return res.status(400).json({ success: false, message: 'No video file provided.' });

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
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
    return res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
  }
});

// ==========================================
// 3. DELETE A VIDEO
// ==========================================
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });

    // Remove from Database
    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Video deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

export default router;