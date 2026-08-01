// backend/utils/cloudinaryUpload.js
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

// Uploads an in-memory file buffer (from multer memoryStorage) straight to
// Cloudinary — nothing ever touches local disk, so nothing gets wiped on
// the next deploy/redeploy.
export function uploadBufferToCloudinary(buffer, { folder, resourceType = 'auto', publicId } = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: publicId },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    console.warn('Cloudinary delete failed:', e.message);
  }
}
