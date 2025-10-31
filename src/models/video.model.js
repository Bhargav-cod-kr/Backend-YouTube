import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// __define-ocg__ Schema for storing video metadata and related details
const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true, // Cloudinary URL of the uploaded video
    },
    thumbnail: {
      type: String,
      required: true, // Cloudinary URL of the video thumbnail
    },
    title: {
      type: String,
      required: true, // Short descriptive title of the video
    },
    description: {
      type: String,
      required: true, // Detailed description of the video
    },
    duration: {
      type: Number,
      required: true, // Duration fetched automatically from Cloudinary metadata
    },
    views: {
      type: Number,
      default: 0, // Auto-incremented when the video is viewed
    },
    isPublished: {
      type: Boolean,
      default: true, // Indicates public or private visibility
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the uploader's user ID
    },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt fields
  }
);

// Enables efficient pagination support for aggregation pipelines
videoSchema.plugin(mongooseAggregatePaginate);

// Exports the Video model for CRUD and aggregation operations
export const Video = mongoose.model("Video", videoSchema);
