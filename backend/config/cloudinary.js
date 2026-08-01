// backend/config/cloudinary.js
// Configures the Cloudinary SDK from env vars. Requires CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to be set — get these from your
// Cloudinary Dashboard (Settings > API Keys).
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export default cloudinary;
