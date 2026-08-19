 import express from 'express';
import Video from '../models/video.js'; 
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js'; 

const router = express.Router();

// ==========================================
// 1. GET ALL VIDEOS (Public access)
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("DEBUG: Fetch videos error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos.', error: error.message });
  }
});

// ==========================================
// 2. SAVE VIDEO URL (Admin only) - Bypasses Vercel 4.5MB Limit!
// ==========================================
router.post('/upload', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached (6 videos). Please delete an old video first.' 
      });
    }

    const { title, videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'No video URL provided.' });
    }

    const newVideo = new Video({
      title: title || 'Property Video',
      videoUrl,
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

    // Note: If you want to delete from Cloudinary as well, you can use cloudinary SDK here, 
    // or simply delete the document from MongoDB.
    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Video deleted successfully.' });
  } catch (error) {
    console.error("DEBUG: Delete error:", error);
    res.status(500).json({ success: false, message: 'Delete failed.', error: error.message });
  }
});

export default router;

