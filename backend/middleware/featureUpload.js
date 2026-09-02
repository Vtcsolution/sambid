import multer from 'multer';

// In-memory only - the route handler pushes the buffer straight to
// Cloudinary, nothing is ever written to local disk (so nothing gets
// wiped when the app folder is redeployed).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images (jpg/png/webp/gif) and videos (mp4/webm/mov) are allowed.'), false);
};

export const featureUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});
