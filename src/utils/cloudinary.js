// Handles uploading files from local server storage to Cloudinary and cleanup of temp files

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Uploads a local file to Cloudinary and removes it from server after successful upload
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    return response; // Return Cloudinary response object
  } catch (error) {
    // Remove local file if upload fails to prevent leftover temp files
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
