import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { featureUpload } from '../middleware/featureUpload.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import {
  getAllFeatures, getFeatureBySlug,
  adminListFeatures, createFeature, updateFeature, deleteFeature, seedDefaults,
} from '../controllers/featureShowcaseController.js';

const router = express.Router();

// Public routes (no auth)
router.get('/',      getAllFeatures);
router.get('/:slug', getFeatureBySlug);

// Admin routes
router.get('/admin/all',   protectAdmin, adminListFeatures);
router.post('/admin/seed', protectAdmin, seedDefaults);
router.post('/admin',      protectAdmin, createFeature);
router.put('/admin/:id',   protectAdmin, updateFeature);
router.delete('/admin/:id', protectAdmin, deleteFeature);

// Upload video/image for feature pages
router.post('/admin/upload', protectAdmin, featureUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const isVideo = req.file.mimetype.startsWith('video/');
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'sambid/feature-showcase',
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
