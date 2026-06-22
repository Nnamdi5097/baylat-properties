 import express from 'express';
import Video from '../models/video.model.js'; 

const router = express.Router();

// ==========================================
// 1. ROUTE: SAVE A NEW REAL ESTATE SHORT CLIP URL WITH CLOUDINARY PUBLIC_ID
// ==========================================
router.post('/upload', async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached. Baylat Properties can only show 6 short videos at a time. Please delete an old video first.' 
      });
    }

    // ⚡ FIXED: Added publicId to destructuring (Cloudinary provides this on successful upload)
    const { title, videoUrl, publicId } = req.body; 

    if (!title || !videoUrl || !publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, video URL, and Cloudinary public ID are all required.' 
      });
    }

    // ⚡ FIXED: Added publicId directly to the document payload instantiation loop
    const newVideo = new Video({
      title,
      videoUrl,
      publicId,
    });

    await newVideo.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Property video short linked beautifully!', 
      video: newVideo 
    });

  } catch (error) {
    console.error('Error saving video stream metadata:', error);
    return res.status(500).json({ success: false, message: 'Server database saving error.', error: error.message });
  }
});

// ==========================================
// 2. ROUTE: GET ALL VIDEOS FOR THE HOME PAGE FEED
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ROUTE: DELETE A VIDEO SHORT
// ==========================================
router.delete('/delete/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video asset not found in database.' });
    }

    await Video.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      success: true, 
      message: 'Video slot freed up successfully! Remember to clear publicId ' + video.publicId + ' from Cloudinary if needed.' 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;