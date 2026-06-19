 import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Video from '../model/video.js'; // Ensure this matches your video model file name

const router = express.Router();

// --- CLOUDINARY CONFIGURATION ---
// This automatically pulls your credentials from your existing .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// 1. ROUTE: UPLOAD A NEW 6-SECOND VIDEO
// ==========================================
router.post('/upload', async (req, res) => {
  try {
    // A. Check the current video limit first
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached. Baylat Properties can only show 6 short videos at a time. Please delete an old video first.' 
      });
    }

    const { title, videoDataUrl } = req.body; // Expecting the video file sent as a base64 string/DataURI from frontend

    if (!title || !videoDataUrl) {
      return res.status(400).json({ success: false, message: 'Title and video file are required.' });
    }

    // B. Upload the video to Cloudinary
    console.log('Uploading property video to Cloudinary...');
    const uploadResponse = await cloudinary.uploader.upload(videoDataUrl, {
      resource_type: 'video',
      folder: 'baylat_property_shorts',
      // Optional: enforce a 6-second clip limit restriction on upload if you want
      duration_range: [0, 7] 
    });

    // C. Save the video details to MongoDB
    const newVideo = new Video({
      title: title,
      videoUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id, // Saved so we can delete it later
    });

    await newVideo.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Property video uploaded beautifully!', 
      video: newVideo 
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ success: false, message: 'Server upload error.', error: error.message });
  }
});

// ==========================================
// 2. ROUTE: GET ALL VIDEOS FOR THE FRONTEND
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }); // Newest videos first
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ROUTE: DELETE A VIDEO (To free up space)
// ==========================================
router.delete('/delete/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // A. Delete from Cloudinary using stored publicId
    await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });

    // B. Delete from MongoDB
    await Video.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Video deleted successfully. Slot freed up!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;