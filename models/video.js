 import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title or property name for this video clip.'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters.'],
    },
    videoUrl: {
      type: String,
      required: [true, 'A secure video URL is required.'],
    },
    publicId: {
      type: String,
      required: false, // Optional since direct client-side uploads don't generate this locally
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    userRef: {
      type: String,
      required: false, // Tracks which admin uploaded the file
    }
  },
  {
    // Automatically adds 'createdAt' and 'updatedAt' timestamps
    timestamps: true, 
  }
);

// Performance optimization: Index createdAt for fast sorting on the home/property views
VideoSchema.index({ createdAt: -1 });

// Ensures Mongoose doesn't compile the model multiple times during server reloads
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default Video;

