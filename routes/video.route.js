 import express from 'express';
import Video from '../model/video.js'; // Ensure this matches your video model file name

const router = express.Router();

// ==========================================
// 1. ROUTE: SAVE A NEW REAL ESTATE SHORT CLIP URL
// ==========================================
router.post('/upload', async (req, res) => {
  try {
    // A. Check the current video limit first (Max 6 clips)
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Upload limit reached. Baylat Properties can only show 6 short videos at a time. Please delete an old video first.' 
      });
    }

    // B. Destructure the title and videoUrl sent from the frontend Firebase upload task
    const { title, videoUrl } = req.body; 

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title and video cloud URL are required.' });
    }

    // C. Save the video text metadata directly to MongoDB
    const newVideo = new Video({
      title: title,
      videoUrl: videoUrl,
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
    const videos = await Video.find().sort({ createdAt: -1 }); // Newest videos first
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ROUTE: DELETE A VIDEO SHORT (To free up slots)
// ==========================================
router.delete('/delete/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video asset not found in database.' });
    }

    // Delete directly from MongoDB (Firebase cleanup can be handled or managed via Firebase expiration rules)
    await Video.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Video slot freed up successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;