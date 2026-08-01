import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { featureUpload } from '../middleware/featureUpload.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import { getContent, adminGetContent, updateContent, seedDefaults } from '../controllers/howItWorksController.js';

const router = express.Router();

// Public: the page reads its content from here
router.get('/', getContent);

// Admin
router.get('/admin', protectAdmin, adminGetContent);
router.put('/admin', protectAdmin, updateContent);
router.post('/admin/seed', protectAdmin, seedDefaults);

// Reuse the feature-showcase upload pipeline for pain-point videos/thumbnails
router.post('/admin/upload', protectAdmin, featureUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const isVideo = req.file.mimetype.startsWith('video/');
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'sambid/how-it-works',
      resourceType: isVideo ? 'video' : 'image',
    });
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        type: isVideo ? 'video' : 'image',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
  }
});

export default router;
