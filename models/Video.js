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
      required: [true, 'Cloud storage public ID is required for deletion.'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    // This automatically adds 'createdAt' and 'updatedAt' timestamps to your database
    timestamps: true, 
  }
);

// This ensures Mongoose doesn't compile the model multiple times during Next.js hot reloads
export default mongoose.models.Video || mongoose.model('Video', VideoSchema);