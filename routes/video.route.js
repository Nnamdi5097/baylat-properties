 import express from 'express';
import Video from '../models/video.js'; 
import { verifyToken } from '../utils/verifyUser.js'; 
import cloudinary from '../utils/cloudinary.js'; // Import your configured cloudinary

const router = express.Router();

// ==========================================
// 1. ROUTE: UPLOAD A NEW REAL ESTATE VIDEO
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

    // 1. You need the file from the request
    // This assumes you are using a middleware like 'express-fileupload' or 'multer'
    // If you are sending the file from the frontend, it will be in req.files
    const file = req.files.video; 

    // 2. Upload to Cloudinary
    // The 'resource_type: "video"' is the key part to fix your error
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video", 
      folder: "baylat_properties"
    });

    // 3. Save to Database
    const newVideo = new Video({
      title: req.body.title,
      videoUrl: result.secure_url,
      publicId: result.public_id,
    });

    await newVideo.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Property video uploaded and linked successfully!', 
      video: newVideo 
    });

  } catch (error) {
    console.error('Error during video upload:', error);
    // If the error message is "Unauthorized", check your Vercel Env Variables!
    return res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
  }
});

// ... (Keep your existing GET /all and DELETE routes as they are) ...

export default router;